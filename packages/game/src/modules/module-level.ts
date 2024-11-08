import RAPIER from "@dimforge/rapier2d"
import { LevelConfig } from "../../proto/world"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"
import { Point, Rect, Size, changeAnchor } from "../model/utils"
import { RocketEntity, rocketComponents } from "./module-rocket"

export interface LevelComponent {
    start: boolean

    cameraRect: Rect
    position: Point
    rotation: number

    collidersCapturing: number
    completed: boolean
}

export const levelComponents = ["level", "body"] satisfies (keyof GameComponents)[]
export type LevelEntity = EntityWith<GameComponents, (typeof levelComponents)[number]>

export class ModuleLevel {
    private getRocket: () => RocketEntity

    private progress?: number
    private progressLevel?: LevelEntity

    private previousBorder?: RAPIER.Collider

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single(...rocketComponents)

        store.events.listen({
            collision: ({ e1, e2, started }) => {
                if (e1?.has(...levelComponents) && e2?.has(...rocketComponents)) {
                    this.handleCollision(e1, e2, started)
                }

                if (e1?.has(...rocketComponents) && e2?.has(...levelComponents)) {
                    this.handleCollision(e2, e1, started)
                }
            },
        })
    }

    onReset() {
        this.progress = undefined
        this.progressLevel = undefined

        for (const level of this.store.entities.multipleCopy(...levelComponents)) {
            this.store.entities.remove(level)
        }

        const config = this.store.resources.get("config")

        const { level: firstLevelConfig } = config.levels
            .map(level => ({
                level,
                distance: Math.sqrt(
                    (level.positionX - config.rocket.positionX) ** 2 +
                        (level.positionY - config.rocket.positionY) ** 2,
                ),
            }))
            .reduce((a, b) => (a.distance < b.distance ? a : b))

        for (const levelConfig of config.levels) {
            this.constructLevel(levelConfig, levelConfig === firstLevelConfig)
        }
    }

    onUpdate(_input: GameInput) {
        if (this.progress !== undefined && this.progressLevel) {
            this.progress -= 1

            if (this.progress <= 0) {
                this.handleFinish(this.progressLevel)
            }
        }
    }

    private handleFinish(level: LevelEntity) {
        const rocketBody = this.getRocket().get("body")
        const rocketVelocity = rocketBody.linvel()

        if (
            Math.abs(rocketVelocity.x) > ROCKET_SPEED_TOLERANCE ||
            Math.abs(rocketVelocity.y) > ROCKET_SPEED_TOLERANCE
        ) {
            return
        }

        const captured = level
        this.progressLevel = undefined

        const world = this.store.resources.get("world")
        const body = captured.get("body")
        world.removeRigidBody(body)

        const levelComponent = captured.get("level")
        levelComponent.completed = true
        levelComponent.collidersCapturing = 0
        this.constructBorder(levelComponent)

        this.store.events.invoke.captured?.({
            rocket: this.store.entities.single(...rocketComponents)(),
            level: captured,
        })
    }

    private handleCollision(level: LevelEntity, rocket: RocketEntity, started: boolean) {
        const levelComponent = level.get("level")

        if (started) {
            if (levelComponent.collidersCapturing === 0) {
                this.progress = TICKS_TO_CAPTURE
                this.progressLevel = level
            }

            levelComponent.collidersCapturing++
        } else {
            levelComponent.collidersCapturing--

            if (levelComponent.collidersCapturing === 0) {
                this.progress = undefined
                this.progressLevel = undefined
            }
        }

        this.store.events.invoke.captureChanged?.({
            rocket,
            level,
            started,
        })
    }

    private constructBorder(levelComponent: LevelComponent) {
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        if (this.previousBorder) {
            world.removeCollider(this.previousBorder, false)
        }

        const colliderDesc = rapier.ColliderDesc.polyline(
            new Float32Array([
                levelComponent.cameraRect.left,
                levelComponent.cameraRect.top,

                levelComponent.cameraRect.left,
                levelComponent.cameraRect.bottom,

                levelComponent.cameraRect.right,
                levelComponent.cameraRect.bottom,

                levelComponent.cameraRect.right,
                levelComponent.cameraRect.top,

                levelComponent.cameraRect.left,
                levelComponent.cameraRect.top,
            ]),
        )

        this.previousBorder = world.createCollider(colliderDesc)
    }

    private constructLevel(levelConfig: LevelConfig, start: boolean) {
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const position = {
            x: levelConfig.positionX,
            y: levelConfig.positionY,
        }

        const body = world.createRigidBody(new rapier.RigidBodyDesc(rapier.RigidBodyType.Fixed))

        const captureBox = calculateCaptureBox(
            position,
            levelConfig.rotation,
            levelConfig.captureAreaLeft,
            levelConfig.captureAreaRight,
        )

        if (start === false) {
            world.createCollider(
                rapier.ColliderDesc.cuboid(captureBox.size.width, captureBox.size.height)
                    .setTranslation(captureBox.transformed.x, captureBox.transformed.y)
                    .setRotation(levelConfig.rotation)
                    .setSensor(true),
                body,
            )
        }

        const level = this.store.entities.create({
            body,
            level: {
                start,

                cameraRect: {
                    left: levelConfig.cameraTopLeftX,
                    top: levelConfig.cameraTopLeftY,
                    right: levelConfig.cameraBottomRightX,
                    bottom: levelConfig.cameraBottomRightY,
                },
                position,
                rotation: levelConfig.rotation,

                collidersCapturing: 0,
                completed: start,
            },
        })

        if (start) {
            this.constructBorder(level.get("level"))
        }
    }
}

const ROCKET_SPEED_TOLERANCE = 0.001
const TICKS_TO_CAPTURE = 60
const FLAG_CAPTURE_HEIGHT = 0.5

export const LEVEL_SIZE: Size = {
    width: 1.65,
    height: 2.616,
}

function calculateCaptureBox(
    position: Point,
    rotation: number,
    captureDistanceLeft: number,
    captureDistanceRight: number,
) {
    const transformed = changeAnchor(
        { x: position.x, y: position.y },
        rotation,
        LEVEL_SIZE,
        { x: 0.5, y: 1 },
        { x: 0.2, y: 0 },
    )

    const size = {
        width: captureDistanceLeft + captureDistanceRight,
        height: FLAG_CAPTURE_HEIGHT,
    }

    return { size, transformed }
}

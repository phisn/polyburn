import RAPIER from "@dimforge/rapier2d"
import { LevelConfig } from "../../proto/world"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { changeAnchor, Point, Rect, Size, Transform } from "../model/utils"
import { GameComponents, GameStore } from "../store"
import { rocketComponents, RocketEntity } from "./module-rocket"

export interface LevelComponent {
    cameraRect: Rect
    index: number
    start: boolean

    collidersCapturing: number
    completed: boolean
}

export const levelComponents = ["level", "transform"] satisfies (keyof GameComponents)[]
export type LevelEntity<Components extends GameComponents = GameComponents> = EntityWith<
    Components,
    (typeof levelComponents)[number]
>

export class ModuleLevel {
    private getRocket: () => RocketEntity

    private progress?: number
    private progressLevel?: LevelEntity

    private previousBorder?: RAPIER.Collider

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single("body", ...rocketComponents)

        store.events.listen({
            collision: ({ e1, e2, started }) => {
                if (e1?.has(...levelComponents) && e2?.has(...rocketComponents)) {
                    this.handleCollision(e1, started)
                }

                if (e1?.has(...rocketComponents) && e2?.has(...levelComponents)) {
                    this.handleCollision(e2, started)
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

        const groups = config.world.gamemodes[config.gamemode].groups.map(
            groupName => config.world.groups[groupName],
        )

        const levels = groups.flatMap(group => group.levels)
        const [rocket] = groups.flatMap(group => group.rockets)

        const { level: firstLevelConfig } = levels
            .map(level => ({
                level,
                distance: Math.sqrt(
                    (level.positionX - rocket.positionX) ** 2 +
                        (level.positionY - rocket.positionY) ** 2,
                ),
            }))
            .reduce((a, b) => (a.distance < b.distance ? a : b))

        for (let i = 0; i < levels.length; ++i) {
            const levelConfig = levels[i]
            this.constructLevel(i, levelConfig, levelConfig === firstLevelConfig)
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

        if (captured.has("body")) {
            const body = captured.get("body")
            world.removeRigidBody(body)
            captured.delete("body")
        }

        const levelComponent = captured.get("level")
        levelComponent.completed = true
        levelComponent.collidersCapturing = 0
        this.constructBorder(levelComponent)

        this.store.events.invoke.captured?.({
            rocket: this.store.entities.single(...rocketComponents)(),
            level: captured,
        })
    }

    private handleCollision(level: LevelEntity, started: boolean) {
        const levelComponent = level.get("level")

        if (started) {
            if (levelComponent.collidersCapturing === 0) {
                this.progress = TICKS_TO_CAPTURE
                this.progressLevel = level

                this.store.events.invoke.captureChanged?.({
                    level,
                    started: true,
                })
            }

            levelComponent.collidersCapturing++
        } else {
            levelComponent.collidersCapturing--

            if (levelComponent.collidersCapturing === 0) {
                this.progress = undefined
                this.progressLevel = undefined

                this.store.events.invoke.captureChanged?.({
                    level,
                    started: false,
                })
            }
        }
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

    private constructLevel(index: number, levelConfig: LevelConfig, start: boolean) {
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const transform: Transform = {
            point: {
                x: levelConfig.positionX,
                y: levelConfig.positionY,
            },
            rotation: levelConfig.rotation,
        }

        const body = world.createRigidBody(new rapier.RigidBodyDesc(rapier.RigidBodyType.Fixed))

        const captureBox = calculateCaptureBox(
            transform.point,
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
                cameraRect: {
                    left: levelConfig.cameraTopLeftX,
                    top: levelConfig.cameraTopLeftY,
                    right: levelConfig.cameraBottomRightX,
                    bottom: levelConfig.cameraBottomRightY,
                },
                index,
                start,

                collidersCapturing: 0,
                completed: start,
            },
            transform,
        }) satisfies LevelEntity

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

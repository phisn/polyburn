import { LevelConfig } from "../../proto/world"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"
import { Point, Rect, Size, changeAnchor } from "../model/utils"
import { RocketEntity, rocketComponents } from "./module-rocket"

export interface LevelComponent {
    config: LevelConfig

    capturing: boolean
    completed: boolean

    cameraRect: Rect
}

export const levelComponents = ["level", "body"] satisfies (keyof GameComponents)[]
export type LevelEntity = EntityWith<GameComponents, (typeof levelComponents)[number]>

export class ModuleLevel {
    private progress?: number
    private progressLevel?: LevelEntity

    constructor(private store: GameStore) {
        store.events.listen({
            collision: ({ e1, e2, started }) => {
                if (e1.has(...levelComponents) && e2.has(...rocketComponents)) {
                    this.handleCollision(e1, e2, started)
                }

                if (e1.has(...rocketComponents) && e2.has(...levelComponents)) {
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

        let nearestLevel: LevelEntity | undefined
        let nearestDistance = Infinity

        for (const levelConfig of config.levels) {
            const level = this.constructLevel(levelConfig)

            const distance = Math.sqrt(
                (levelConfig.positionX - config.rocket.positionX) ** 2 +
                    (levelConfig.positionY - config.rocket.positionY) ** 2,
            )

            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestLevel = level
            }
        }

        if (nearestLevel === undefined) {
            throw new Error("No levels")
        }

        const level = nearestLevel.get("level")
        level.completed = true
    }

    onUpdate(_input: GameInput) {
        if (this.progress && this.progressLevel) {
            this.progress -= 1

            if (this.progress <= 0) {
                const captured = this.progressLevel
                this.progressLevel = undefined

                const world = this.store.resources.get("world")
                const body = captured.get("body")
                world.removeRigidBody(body)

                const level = captured.get("level")
                level.completed = true
                level.capturing = false

                this.store.events.invoke.captured?.({
                    rocket: this.store.entities.single(...rocketComponents)(),
                    level: captured,
                })
            }
        }
    }

    private handleCollision(level: LevelEntity, rocket: RocketEntity, started: boolean) {
        if (started) {
            this.progress = TICKS_TO_CAPTURE
            this.progressLevel = level

            level.get("level").capturing = true
        } else {
            this.progress = undefined
            this.progressLevel = undefined

            level.get("level").capturing = false
        }

        this.store.events.invoke.captureChanged?.({
            rocket,
            level,
            started,
        })
    }

    private constructLevel(levelConfig: LevelConfig) {
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const body = world.createRigidBody(new rapier.RigidBodyDesc(rapier.RigidBodyType.Fixed))

        const captureBox = calculateCaptureBox(
            { x: levelConfig.positionX, y: levelConfig.positionY },
            levelConfig.rotation,
            levelConfig.captureAreaLeft,
            levelConfig.captureAreaRight,
        )

        world.createCollider(
            rapier.ColliderDesc.cuboid(captureBox.size.width, captureBox.size.height)
                .setTranslation(captureBox.transformed.x, captureBox.transformed.y)
                .setRotation(levelConfig.rotation)
                .setSensor(true),
            body,
        )

        const level = this.store.entities.create({
            body,
            level: {
                config: levelConfig,

                capturing: false,
                completed: false,

                cameraRect: {
                    left: levelConfig.cameraTopLeftX,
                    top: levelConfig.cameraTopLeftY,
                    right: levelConfig.cameraBottomRightX,
                    bottom: levelConfig.cameraBottomRightY,
                },
            },
        })

        return level
    }
}

const TICKS_TO_CAPTURE = 60
const FLAG_CAPTURE_HEIGHT = 0.5

const LEVEL_SIZE: Size = {
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

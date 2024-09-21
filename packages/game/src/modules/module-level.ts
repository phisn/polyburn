import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"
import { RocketEntity, rocketComponents } from "./module-rocket"

export interface LevelComponent {
    completed: boolean
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

    onReset() {}

    onUpdate(_input: GameInput) {
        if (this.progress && this.progressLevel) {
            this.progress -= 1

            if (this.progress <= 0) {
                const world = this.store.resources.get("world")

                const body = this.progressLevel.get("body")
                const level = this.progressLevel.get("level")

                world.removeRigidBody(body)

                level.completed = true
                this.progressLevel = undefined
            }
        }
    }

    private handleCollision(level: LevelEntity, rocket: RocketEntity, started: boolean) {
        if (started) {
            this.progress = TICKS_TO_CAPTURE
            this.progressLevel = level
        } else {
            this.progress = undefined
            this.progressLevel = undefined
        }

        this.store.events.invoke.captureChanged?.({
            rocket,
            level,
            started,
        })
    }
}

const TICKS_TO_CAPTURE = 60

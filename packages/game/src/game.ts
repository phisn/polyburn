import RAPIER from "@dimforge/rapier2d"
import { WorldConfig } from "../proto/world"
import { GameStore } from "./model/store"
import { ModuleLevel } from "./modules/module-level"
import { ModuleRocket } from "./modules/module-rocket"
import { ModuleShape } from "./modules/module-shape"
import { ModuleWorld } from "./modules/module-world"

export interface GameConfig {
    gamemode: string
    world: WorldConfig
}

export interface GameDependencies {
    rapier: typeof RAPIER
}

export interface GameInput {
    rotation: number
    thrust: boolean
}

export class Game {
    public store: GameStore

    private moduleLevel: ModuleLevel
    private moduleRocket: ModuleRocket
    private moduleShape: ModuleShape
    private moduleWorld: ModuleWorld

    private started = false
    private reset = false

    constructor(config: GameConfig, deps: GameDependencies) {
        this.store = new GameStore()

        this.insertResources(config, deps)

        this.moduleLevel = new ModuleLevel(this.store)
        this.moduleRocket = new ModuleRocket(this.store)
        this.moduleShape = new ModuleShape(this.store)
        this.moduleWorld = new ModuleWorld(this.store)

        this.onReset()

        this.store.events.listen({
            death: () => {
                const summary = this.store.resources.get("summary")

                if (summary.flags === 0) {
                    this.reset = true
                }
            },
        })
    }

    public onUpdate(input: GameInput) {
        if (this.started === false) {
            if (input.thrust === false) {
                return
            }

            this.started = true
        }

        if (this.reset) {
            this.onReset()
            this.reset = false
        }

        this.moduleLevel.onUpdate(input)
        this.moduleRocket.onUpdate(input)
        this.moduleWorld.onUpdate(input)
    }

    public onReset() {
        this.moduleWorld.onReset()

        this.moduleLevel.onReset()
        this.moduleRocket.onReset()
        this.moduleShape.onReset()
    }

    private insertResources(config: GameConfig, deps: GameDependencies) {
        const groups = config.world.gamemodes[config.gamemode].groups.map(
            groupName => config.world.groups[groupName],
        )

        const levels = groups.flatMap(group => group.levels)
        const rockets = groups.flatMap(group => group.rockets)
        const shapes = groups.flatMap(group => group.shapes)

        this.store.resources.set("config", {
            world: config.world,
            levels,
            rocket: rockets[0],
            shapes,
        })

        this.store.resources.set("rapier", deps.rapier)
    }
}

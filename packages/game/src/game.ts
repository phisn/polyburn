import RAPIER from "@dimforge/rapier2d"
import { WorldConfig } from "../proto/world"
import { GameOutput } from "./model/api"
import { ModuleLevel } from "./modules/module-level"
import { ModuleRocket, rocketComponents, RocketEntity } from "./modules/module-rocket"
import { ModuleShape } from "./modules/module-shape"
import { ModuleWorld } from "./modules/module-world"
import { GameStore } from "./store"

export interface GameConfig {
    gamemode: string
    worldname: string
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
    private moudleOutputCollect: ModuleOutputCollect
    private moduleRocket: ModuleRocket
    private moduleShape: ModuleShape
    private moduleWorld: ModuleWorld

    constructor(config: GameConfig, deps: GameDependencies) {
        this.store = new GameStore()

        this.insertResources(config, deps)

        this.moduleLevel = new ModuleLevel(this.store)
        this.moudleOutputCollect = new ModuleOutputCollect(this.store)
        this.moduleRocket = new ModuleRocket(this.store)
        this.moduleShape = new ModuleShape(this.store)
        this.moduleWorld = new ModuleWorld(this.store)

        this.onReset()
    }

    public onUpdate(input: GameInput): GameOutput {
        this.moduleLevel.onUpdate(input)
        this.moduleRocket.onUpdate(input)
        this.moduleWorld.onUpdate(input)

        return this.moudleOutputCollect.output()
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
            gameConfig: config,
            levels,
            rocket: rockets[0],
            shapes,
        })

        this.store.resources.set("rapier", deps.rapier)
    }
}

class ModuleOutputCollect {
    private currentOutput: GameOutput
    private getRocket: () => RocketEntity

    constructor(private store: GameStore) {
        this.currentOutput = {
            thrust: false,
            transform: {
                point: {
                    x: 0,
                    y: 0,
                },
                rotation: 0,
            },
            velocity: {
                x: 0,
                y: 0,
            },
        }

        this.getRocket = this.store.entities.single(...rocketComponents)

        this.store.events.listen({
            death: ({ contactPoint, normal }) => {
                this.currentOutput.onRocketDeath = {
                    contactPoint,
                    normal,
                }
            },
            captureChanged: ({ level, started }) => {
                this.currentOutput.onLevelCaptureChange = {
                    level: level.get("level").index,
                    started,
                }
            },
            captured: ({ level }) => {
                this.currentOutput.onLevelCaptured = {
                    level: level.get("level").index,
                }
            },
            rocketHit: ({ contactPoint, normal, speed }) => {
                if (speed > ROCKET_TOUCH_SPEED) {
                    this.currentOutput.onRocketCollision = {
                        contactPoint,
                        normal,
                        speed,
                    }
                }
            },
        })
    }

    output(): GameOutput {
        const rocketEntity = this.getRocket()
        const body = rocketEntity.get("body")
        const rocket = rocketEntity.get("rocket")

        this.currentOutput.thrust = rocket.thrust
        this.currentOutput.transform.point.x = body.translation().x
        this.currentOutput.transform.point.y = body.translation().y
        this.currentOutput.transform.rotation = body.rotation()
        this.currentOutput.velocity.x = body.linvel().x
        this.currentOutput.velocity.y = body.linvel().y

        return this.currentOutput
    }
}

const ROCKET_TOUCH_SPEED = 30

import RAPIER from "@dimforge/rapier2d"
import { LevelConfig, RocketConfig, ShapeConfig } from "../proto/world"
import { EntityStore, EntityWith, newEntityStore } from "./framework/entity"
import { EventStore } from "./framework/event"
import { ResourceStore } from "./framework/resource"
import { GameConfig } from "./game"
import { Point } from "./model/utils"
import { LevelComponent, LevelEntity } from "./modules/module-level"
import { RocketComponent, RocketEntity } from "./modules/module-rocket"
import { ShapeComponent } from "./modules/module-shape"
import { SummaryResource } from "./modules/module-world"

export class GameStore {
    public resources: ResourceStore<GameResources>
    public events: EventStore<GameEvents>
    public entities: EntityStore<GameComponents>

    constructor() {
        this.resources = new ResourceStore()
        this.events = new EventStore()
        this.entities = newEntityStore()
    }
}

export interface ConfigsResource {
    gameConfig: GameConfig
    levels: LevelConfig[]
    rocket: RocketConfig
    shapes: ShapeConfig[]
}

export interface GameResources {
    config: ConfigsResource
    rapier: typeof RAPIER
    summary: SummaryResource
    world: RAPIER.World
}

export interface GameComponents {
    level: LevelComponent
    body: RAPIER.RigidBody
    rocket: RocketComponent
    shape: ShapeComponent
}

export interface GameEvents {
    collision(props: {
        c1: RAPIER.Collider
        c2: RAPIER.Collider

        e1?: EntityWith<GameComponents, "body">
        e2?: EntityWith<GameComponents, "body">

        started: boolean
    }): void

    rocketHit(props: {
        angle: number
        contactPoint: Point
        normal: Point
        rocket: RocketEntity
        speed: number
    }): void

    death(props: {
        rocket: RocketEntity

        contactPoint: Point
        normal: Point
    }): void

    captureChanged(props: { level: LevelEntity; started: boolean }): void
    captured(props: { level: LevelEntity; rocket: RocketEntity }): void

    finished(): void
}

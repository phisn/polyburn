import RAPIER from "@dimforge/rapier2d"
import { LevelConfig, RocketConfig, ShapeConfig, WorldConfig } from "../../proto/world"
import { EntityStore, EntityWith, newEntityStore } from "../framework/entity"
import { EventStore } from "../framework/event"
import { ResourceStore } from "../framework/resource"
import { LevelComponent, LevelEntity } from "../modules/module-level"
import { RocketComponent, RocketEntity } from "../modules/module-rocket"
import { ShapeComponent } from "../modules/module-shape"
import { SummaryResource } from "../modules/module-world"
import { Point } from "./utils"

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
    levels: LevelConfig[]
    rocket: RocketConfig
    shapes: ShapeConfig[]
    world: WorldConfig
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

    death(props: {
        rocket: RocketEntity

        contactPoint: Point
        normal: Point
    }): void

    captureChanged(props: { rocket: RocketEntity; level: LevelEntity; started: boolean }): void
    captured(props: { rocket: RocketEntity; level: LevelEntity }): void

    finished(): void
}

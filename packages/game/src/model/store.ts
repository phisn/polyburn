import RAPIER from "@dimforge/rapier2d"
import { LevelConfig, RocketConfig, ShapeConfig, WorldConfig } from "../../proto/world"
import { EntityStore, newEntityStore } from "../framework/entity"
import { EventStore } from "../framework/event"
import { ResourceStore } from "../framework/resource"
import { LevelComponent } from "../modules/module-level"
import { RocketComponent } from "../modules/module-rocket"
import { Point } from "./point"

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
    world: RAPIER.World
}

export interface GameComponents {
    level: LevelComponent
    rigid: RAPIER.RigidBody
    rocket: RocketComponent
}

export interface GameEvents {
    collision(props: {
        started: boolean

        normal: Point
        contact: Point
    }): void
}

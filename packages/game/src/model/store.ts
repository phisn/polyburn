import RAPIER from "@dimforge/rapier2d"
import { LevelConfig, RocketConfig, ShapeConfig } from "../../proto/world"
import { EntityStore, EntityWith, newEntityStore } from "../framework/entity"
import { EventStore } from "../framework/event"
import { ResourceStore } from "../framework/resource"
import { GameConfig } from "../game"
import { LevelComponent, LevelEntity } from "../modules/module-level"
import { RocketComponent, RocketEntity } from "../modules/module-rocket"
import { ShapeComponent } from "../modules/module-shape"
import { SummaryResource } from "../modules/module-world"
import { Point, Transform } from "./utils"

export class GameStore {
    public resources: ResourceStore<GameResources>
    public events: EventStore<GameEvents>
    public entities: EntityStore<GameComponents>
    public outputEvents: EventStore<GameOutputEvents>

    constructor() {
        this.resources = new ResourceStore()
        this.events = new EventStore()
        this.entities = newEntityStore()
        this.outputEvents = new EventStore()
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

    death(props: {
        rocket: RocketEntity

        contactPoint: Point
        normal: Point
    }): void

    captured(props: { rocket: RocketEntity; level: LevelEntity }): void

    finished(): void
}

export interface GameOutputFrame {
    onCaptured?: { level: number }
    onDeath?: { contactPoint: Point; normal: Point }
    onRocketCollision?: { contactPoint: Point; normal: Point }

    setCapture?: { level: number; started: boolean }
    setRocket?: { transform: Transform; velocity: Point }
    setThrust?: { started: boolean }
}

export interface GameOutput {
    version: 1
    frames: GameOutputFrame[]
}

export type GameOutputEvents = {
    [K in keyof GameOutputFrame]-?: (props: Required<GameOutputFrame>[K]) => void
}

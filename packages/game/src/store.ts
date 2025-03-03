import RAPIER from "@dimforge/rapier2d"
import { WorldConfig } from "../proto/world"
import { EntityStore, EntityWith } from "./framework/entity"
import { EventStore } from "./framework/event"
import { ResourceStore } from "./framework/resource"
import { Point, Transform } from "./model/utils"
import { LevelComponent, LevelEntity } from "./modules/module-level"
import { RocketComponent, RocketEntity } from "./modules/module-rocket"
import { ShapeComponent } from "./modules/module-shape"
import { SummaryResource } from "./modules/module-world"

export interface GameConfig {
    gamemode: string
    worldname: string
    world: WorldConfig
}

export interface GameStore {
    resources: ResourceStore<GameResources>
    events: EventStore<GameEvents>
    entities: EntityStore<GameComponents>
}

export interface GameResources {
    config: GameConfig
    rapier: typeof RAPIER
    summary: SummaryResource
    world: RAPIER.World
}

export interface GameComponents {
    level: LevelComponent
    body: RAPIER.RigidBody
    rocket: RocketComponent
    shape: ShapeComponent
    transform: Transform
    velocity: Point
}

export interface GameEvents<Components extends GameComponents = GameComponents> {
    collision(props: {
        c1: RAPIER.Collider
        c2: RAPIER.Collider

        e1?: EntityWith<Components, "body">
        e2?: EntityWith<Components, "body">

        started: boolean
    }): void

    rocketHit(props: {
        angle: number
        contactPoint: Point
        normal: Point
        rocket: RocketEntity<Components>
        speed: number
    }): void

    death(props: {
        rocket: RocketEntity<Components>

        contactPoint: Point
        normal: Point
    }): void

    captureChanged(props: { level: LevelEntity<Components>; started: boolean }): void
    captured(props: { level: LevelEntity<Components>; rocket: RocketEntity<Components> }): void

    finished(): void
}

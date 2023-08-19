import { EntityType } from "../../proto/world"

export interface RocketConfig {
    thrustDistance: number
    thrustValue: number
    thrustGroundMultiplier: number
    explosionAngle: number
}

export interface RocketEntity {
    type: EntityType.ROCKET
    position: { x: number; y: number }
    rotation: number

    defaultConfig: RocketConfig
}

export interface LevelEntity {
    type: EntityType.LEVEL
    position: { x: number; y: number }
    rotation: number

    cameraTopLeft: { x: number; y: number }
    cameraBottomRight: { x: number; y: number }

    captureAreaLeft: number
    captureAreaRight: number

    rocketConfig?: RocketConfig
}

export interface ShapeVertex {
    x: number
    y: number
    color: number
}

export interface ShapeEntity {
    type: EntityType.SHAPE
    vertices: ShapeVertex[]
}

export type Entity = RocketEntity | LevelEntity | ShapeEntity

export interface Gamemode {
    name: string
    groups: string[]
}

export interface World {
    gamemodes: Gamemode[]
    groups: { [name: string]: Entity[] }
}

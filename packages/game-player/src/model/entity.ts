import { LevelConfig, RocketConfig, ShapeConfig } from "game/proto/world"
import { ShapeVertex } from "game/src/model/shape"
import { Point, Rect, Transform } from "game/src/model/utils"
import * as THREE from "three"

export interface GamePlayerComponents {
    interpolation: InterpolationComponent
    level: LevelComponent
    rocket: RocketComponent
    shape: ShapeComponent
    three: THREE.Object3D
    transform: Transform
}

export interface InterpolationComponent {
    sourceTransform: Transform
    targetTransform: Transform
}

export interface LevelComponent {
    bounding: Rect
    config: LevelConfig
    first: boolean
}

export interface RocketComponent {
    config: RocketConfig
    thrust: boolean
    velocity: Point
}

export interface ShapeComponent {
    config: ShapeConfig
    vertices: ShapeVertex[]
}

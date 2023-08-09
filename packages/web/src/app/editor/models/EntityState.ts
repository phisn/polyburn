import { LevelState } from "../entities/level/LevelState"
import { RocketState } from "../entities/rocket/RocketState"
import { ShapeState } from "../entities/shape/ShapeState"

export type EntityState = ShapeState | RocketState | LevelState

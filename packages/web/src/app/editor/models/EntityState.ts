import { LevelState } from "../entities/LevelState"
import { RocketState } from "../entities/RocketState"
import { ShapeState } from "../entities/shape/ShapeState"

export type EntityState = ShapeState | RocketState | LevelState

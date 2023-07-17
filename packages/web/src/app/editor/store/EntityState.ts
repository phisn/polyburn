import { LevelState } from "../entities/LevelState"
import { RocketState } from "../entities/RocketState"
import { ShapeState } from "../entities/ShapeState"

export type EntityState = ShapeState | RocketState | LevelState

import { LevelState } from "../entities/level/level-state"
import { RocketState } from "../entities/rocket/rocket-state"
import { ShapeState } from "../entities/shape/shape-state"

export type EntityState = ShapeState | RocketState | LevelState

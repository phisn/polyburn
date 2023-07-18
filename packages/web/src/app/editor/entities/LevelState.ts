import { EntityType } from "runtime/src/core/common/EntityType"

export interface LevelState {
    type: EntityType.Level
    id: number
    selected: boolean

    position: { x: number; y: number }
    rotation: number
}


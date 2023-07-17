import { EntityType } from "runtime/src/core/common/EntityType"

export interface LevelState {
    type: EntityType.Level

    position: { x: number; y: number }
    rotation: number
}

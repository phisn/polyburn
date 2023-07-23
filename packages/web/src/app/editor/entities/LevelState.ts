import { EntityType } from "runtime/src/core/common/EntityType"
import { BaseEntityState } from "../store/BaseEntityState"

export interface LevelState extends BaseEntityState {
    type: EntityType.Level
    selected: boolean

    position: { x: number; y: number }
    rotation: number
}

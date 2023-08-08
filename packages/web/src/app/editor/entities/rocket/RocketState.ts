import { EntityType } from "runtime/src/core/common/EntityType"
import { BaseEntityState } from "../../store/BaseEntityState"

export interface RocketState extends BaseEntityState {
    type: EntityType.Rocket

    position: { x: number; y: number }
    rotation: number
}

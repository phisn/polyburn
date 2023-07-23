import { EntityType } from "runtime/src/core/common/EntityType"
import { BaseEntityState } from "../store/BaseEntityState"

export interface RocketState extends BaseEntityState {
    type: EntityType.Rocket
    selected: boolean

    position: { x: number; y: number }
    rotation: number
}
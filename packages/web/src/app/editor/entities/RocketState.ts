import { EntityType } from "runtime/src/core/common/EntityType"

export interface RocketState {
    type: EntityType.Rocket

    position: { x: number; y: number }
    rotation: number
}

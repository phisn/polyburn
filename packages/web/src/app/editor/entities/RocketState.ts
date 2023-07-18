import { EntityType } from "runtime/src/core/common/EntityType"

export interface RocketState {
    type: EntityType.Rocket
    id: number
    selected: boolean

    position: { x: number; y: number }
    rotation: number
}


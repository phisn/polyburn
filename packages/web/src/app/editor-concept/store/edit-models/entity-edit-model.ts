import { EntityType } from "runtime/proto/world"

export interface EntityEditModel {
    type: EntityType
    id: number
    group?: string
}

export interface RocketEditModel extends EntityEditModel {
    type: EntityType.ROCKET

    position: { x: number; y: number }
    rotation: number
}

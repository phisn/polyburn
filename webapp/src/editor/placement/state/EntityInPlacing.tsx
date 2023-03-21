import { Entity, EntityType } from "../../../model/world/Entity"
import { Point } from "../../../model/world/Point"

// the reason why we do not use the entity directly is because we only want to create
// a new entity on placing with information about its intial position and rotation. later
// when we move the entity we do not want to change other position related properties
export interface EntityInPlacing {
    type: EntityType
    position: Point
    rotation: number

    // when placing an entity for the first time
    // we do not have a entity yet. so this is only non-null
    // when we are moving an existing entity
    buffered: Entity | null
}
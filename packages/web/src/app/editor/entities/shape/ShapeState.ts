import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"

export interface ShapeState {
    type: EntityType.Shape
    id: number

    position: Vector3
    vertices: Vector2[]
}

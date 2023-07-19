import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2 } from "three"

export interface ShapeState {
    type: EntityType.Shape
    id: number

    vertices: Vector2[]
}


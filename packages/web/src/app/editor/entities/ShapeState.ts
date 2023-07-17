import { EntityType } from "runtime/src/core/common/EntityType"

export interface ShapeState {
    type: EntityType.Shape

    vertices: { x: number; y: number }[]
}

import { EntityType } from "runtime/src/core/common/EntityType"

export interface ShapeState {
    type: EntityType.Shape
    id: number
    selected: boolean

    vertices: { x: number; y: number }[]
}


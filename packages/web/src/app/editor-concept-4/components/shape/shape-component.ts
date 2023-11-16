import { Vector2 } from "three"

export interface ShapeBehavior {
    vertices: EditorShapeVertex[]
}

export interface EditorShapeVertex {
    point: Vector2
    color: number
}

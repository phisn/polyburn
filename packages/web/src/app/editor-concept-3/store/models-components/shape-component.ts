import { Vector2 } from "three"

export interface ShapeComponent {
    vertices: EditorShapeVertex[]
}

export interface EditorShapeVertex {
    point: Vector2
    color: number
}

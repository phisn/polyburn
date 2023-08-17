import { Point } from "../../model/world/Point"

export interface ShapeComponent {
    vertices: ShapeVertex[]
}

export interface ShapeVertex {
    point: Point
    color: number
}

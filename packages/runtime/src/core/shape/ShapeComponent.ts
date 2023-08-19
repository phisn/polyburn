import { Point } from "../../model/Point"

export interface ShapeComponent {
    vertices: ShapeVertex[]
}

export interface ShapeVertex {
    point: Point
    color: number
}

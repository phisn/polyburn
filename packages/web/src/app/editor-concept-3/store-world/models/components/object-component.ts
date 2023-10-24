import { Point } from "runtime/src/model/point"

export interface ObjectComponent {
    position: Point
    rotation: number

    isInside(point: Point): boolean
    size(): { width: number; height: number }
}

import { Point } from "game/src/model/utils"

export interface ObjectBehavior {
    position: Point
    rotation: number

    isInside(point: Point): boolean
    size(): { width: number; height: number }
}

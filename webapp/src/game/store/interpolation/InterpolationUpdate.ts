import { Point } from "../../../model/world/Point"

export interface InterpolationUpdate {
    rocket: {
        position: Point
        rotation: number
    }
}
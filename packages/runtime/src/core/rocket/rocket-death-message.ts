import { Point } from "../../model/point"

export interface RocketDeathMessage {
    position: Point
    normal: Point
    contactPoint: Point
    rotation: number
}

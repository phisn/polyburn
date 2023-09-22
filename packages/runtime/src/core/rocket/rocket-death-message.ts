import { Point } from "../../model/point"

export interface RocketDeathMessage {
    position: Point
    normal: Point
    rotation: number
}

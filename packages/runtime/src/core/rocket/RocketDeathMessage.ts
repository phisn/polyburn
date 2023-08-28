import { Point } from "../../model/Point"

export interface RocketDeathMessage {
    position: Point
    normal: Point
    rotation: number
}

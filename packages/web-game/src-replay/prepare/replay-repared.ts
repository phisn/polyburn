import { Point } from "runtime/src/model/point"

export interface PreparedFrame {
    position: Point
    rotation: number
}

export interface ReplayPrepared {
    frames: PreparedFrame[]
}

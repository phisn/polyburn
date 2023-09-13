import { Point } from "runtime/src/model/Point"

export interface PreparedFrame {
    position: Point
    rotation: number
}

export interface ReplayPrepared {
    frames: PreparedFrame[]
}

import { Point } from "../Point"

export interface Level {
    cameraTopLeft: Point
    cameraBottomRight: Point

    flagPosition: Point
    flagRotation: number

    flagCaptureLeft: number
    flagCaptureRight: number
}

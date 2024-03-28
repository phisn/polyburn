import { Point } from "runtime/src/model/point"

export interface PipelineStateMovingCamera {
    type: "moving-camera"
    offsetPosition: Point
    startPosition: Point
}

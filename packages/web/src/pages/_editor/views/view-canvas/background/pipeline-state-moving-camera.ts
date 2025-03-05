import { Point } from "game/src/model/utils"

export interface PipelineStateMovingCamera {
    type: "moving-camera"
    offsetPosition: Point
    startPosition: Point
}

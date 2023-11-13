import { Point } from "runtime/src/model/point"
import { ImmutableEntityWith } from "../../entities/entity"

export interface MovingEntityEntry {
    entity: ImmutableEntityWith<"object">

    offsetPosition: Point
    offsetRotation: number

    position: Point
    rotation: number
}

export interface PipelineStateMoving {
    type: "moving"
    entries: MovingEntityEntry[]
}

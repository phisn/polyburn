import { Point } from "runtime/src/model/point"
import { ImmutableEntityWith } from "../../store-world/models/entity"

export interface PipelineMovingState {
    type: "moving"
    entries: MovingEntityEntry[]
}

export interface MovingEntityEntry {
    entity: ImmutableEntityWith<"object">

    offsetPosition: Point
    offsetRotation: number

    position: Point
    rotation: number
}

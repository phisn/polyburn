import { ImmutableEntityWith } from "../../entities/entity"
import { EventBase } from "../event-base"

export interface ObjectMoveEvent extends EventBase {
    type: "object-hover"

    position: { x: number; y: number }
    rotation: number

    entity: ImmutableEntityWith<"object">
}

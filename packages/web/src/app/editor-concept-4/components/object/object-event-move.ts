import { ImmutableEntityWith } from "../../entities/entity"
import { EventBase } from "../../modules/store/event-base"

export interface ObjectEventMove extends EventBase {
    type: "object-move"

    position: { x: number; y: number }
    rotation: number

    entity: ImmutableEntityWith<"object">
}

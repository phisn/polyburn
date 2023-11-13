import { ImmutableEntityWith } from "../../entities/entity"
import { EventBase } from "../../modules/store/event-base"

export interface ObjectEventHover extends EventBase {
    type: "object-hover"

    entity: ImmutableEntityWith<"object">
}

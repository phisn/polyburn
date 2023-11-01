import { ImmutableEntityWith } from "../../entities/entity"
import { EventBase } from "../event-base"

export interface ObjectHoverEvent extends EventBase {
    type: "object-hover"

    entity: ImmutableEntityWith<"object">
}

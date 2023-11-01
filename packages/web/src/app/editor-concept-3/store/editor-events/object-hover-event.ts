import { ImmutableEntityWith } from "../../store-world/models/entity"
import { EditorEventBase } from "./editor-event-base"

export interface ObjectHoverEvent extends EditorEventBase {
    type: "object-hover"

    entity: ImmutableEntityWith<"object">
}

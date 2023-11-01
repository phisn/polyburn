import { ImmutableEntityWith } from "../../store-world/models/entity"

export interface ObjectAttemptMoveEvent {
    type: "object-attempt-move"

    entity: ImmutableEntityWith<"object">

    position: { x: number; y: number }
    rotation: number
}

import { ObjectHoverEvent } from "./object/object-hover-event"
import { ObjectMoveEvent } from "./object/object-move-event"

export interface HitBackgroundEvent {
    type: "hit-background"
}

export type Event = HitBackgroundEvent | ObjectHoverEvent | ObjectMoveEvent

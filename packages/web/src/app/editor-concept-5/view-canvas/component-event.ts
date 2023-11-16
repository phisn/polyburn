import { ObjectEventHover } from "./object/object-event-hover"
import { ObjectEventMove } from "./object/object-event-move"

export interface HitBackgroundEvent {
    type: "hit-background"
}

export type ComponentEvent = HitBackgroundEvent | ObjectEventHover | ObjectEventMove

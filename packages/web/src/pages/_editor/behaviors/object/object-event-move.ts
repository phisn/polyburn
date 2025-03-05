import { BaseEvent } from "../../store/model/base-event"

export interface ObjectEventMove extends BaseEvent {
    type: "object-move"

    position: { x: number; y: number }
    rotation: number
}

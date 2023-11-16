import { Point } from "runtime/src/model/point"
import { BaseEvent } from "../../store/model/base-event"
import { BaseHighlight } from "../../store/model/base-highlight"

export interface ObjectBehavior {
    position: Point
    rotation: number

    isInside(point: Point): boolean
    size(): { width: number; height: number }
}

export interface ObjectEventMove extends BaseEvent {
    type: "object-move"

    position: { x: number; y: number }
    rotation: number
}

export interface ObjectHighlight extends BaseHighlight {
    type: "object-highlight"
}

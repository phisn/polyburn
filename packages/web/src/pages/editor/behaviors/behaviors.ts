import { EntityType } from "runtime/proto/world"
import { ObjectBehavior } from "./object/object-behavior"
import { ObjectEventMove } from "./object/object-event-move"
import { ObjectHighlight } from "./object/object-highlight"
import { ShapeBehavior } from "./shape/shape-model"

export interface Behaviors {
    type: EntityType
    group: string | undefined

    object?: ObjectBehavior
    shape?: ShapeBehavior
}

export type BehaviorHighlight = ObjectHighlight

export type BehaviorEvent = ObjectEventMove

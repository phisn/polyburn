import { EntityType } from "runtime/proto/world"
import { ObjectBehavior, ObjectEventMove, ObjectHighlight } from "./object/model"
import { ShapeBehavior } from "./shape/shape-component"

export type BehaviorHighlight = ObjectHighlight

export interface HitBackgroundEvent {
    type: "hit-background"
}

export type BehaviorEvent = HitBackgroundEvent | ObjectEventMove

export interface BaseBehaviors {
    type: EntityType
    group: string | undefined

    object?: ObjectBehavior
    shape?: ShapeBehavior
}

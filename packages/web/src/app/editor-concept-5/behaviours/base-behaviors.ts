import { EntityType } from "runtime/proto/world"
import { ObjectBehavior } from "./object/object-behavior"

export interface BaseBehaviors {
    type: EntityType
    group: string | undefined

    object?: ObjectBehavior
}

export type BehaviorType = Exclude<keyof BaseBehaviors, "type" | "group">

export const behaviorOrder: BehaviorType[] = ["object"]

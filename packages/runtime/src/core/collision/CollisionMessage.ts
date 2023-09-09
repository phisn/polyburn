import RAPIER from "@dimforge/rapier2d"
import { Entity } from "runtime-framework"
import { MessageWithTarget } from "runtime-framework/src/MessageWithTarget"

import { RuntimeComponents } from "../RuntimeComponents"

export interface CollisionMessage extends MessageWithTarget<RuntimeComponents> {
    targetCollider: RAPIER.Collider

    other: Entity<RuntimeComponents>
    otherCollider: RAPIER.Collider

    started: boolean
    sensor: boolean
}

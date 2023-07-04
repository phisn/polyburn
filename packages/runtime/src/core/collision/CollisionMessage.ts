import RAPIER from "@dimforge/rapier2d-compat"
import { Entity } from "runtime-framework"

import { RuntimeComponents } from "../RuntimeComponents"

export interface CollisionMessage {
    primary: Entity<RuntimeComponents>
    primaryCollider: RAPIER.Collider

    other: Entity<RuntimeComponents>
    otherCollider: RAPIER.Collider
    
    started: boolean
    sensor: boolean
}

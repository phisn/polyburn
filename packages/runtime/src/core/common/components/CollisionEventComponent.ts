import RAPIER from "@dimforge/rapier2d-compat"
import { Entity } from "runtime-framework"

import { RuntimeComponents } from "../../RuntimeComponents"

export interface CollisionEvent {
    other: Entity<RuntimeComponents>
    otherColliderHandle: RAPIER.ColliderHandle
    
    started: boolean
    sensor: boolean
}

export interface CollisionComponent {
    events: CollisionEvent[]
}

import RAPIER from "@dimforge/rapier2d-compat"
import { EntityId } from "runtime-framework"

interface CollisionEvent {
    other: EntityId
    otherColliderHandle: RAPIER.ColliderHandle
    
    started: boolean
    sensor: boolean
}

export interface CollisionEventComponent {
    events: CollisionEvent[]
}

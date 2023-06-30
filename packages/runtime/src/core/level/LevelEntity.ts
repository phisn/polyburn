import { Entity } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/NarrowComponents"

import { CollisionEvent } from "../common/components/CollisionEventComponent"
import { RuntimeComponents } from "../RuntimeComponents"

export const LevelEntityComponents = ["level", "entityType", "rigidBody"] as const

export type LevelEntity = EntityWith<RuntimeComponents, typeof LevelEntityComponents[number]>

export function isCollisionWithCapture(collision: CollisionEvent, other: Entity<RuntimeComponents>): other is LevelEntity {
    return collision.other?.has(...LevelEntityComponents) &&
        collision.other.components.level.captureCollider.handle === collision.otherColliderHandle
}
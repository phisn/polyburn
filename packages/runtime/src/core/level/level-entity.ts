import { Entity } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/narrow-properties"

import { CollisionMessage } from "../collision/collision-message"
import { RuntimeComponents } from "../runtime-components"

export const LevelEntityComponents = ["level", "entityType", "rigidBody"] as const

export type LevelEntity = EntityWith<RuntimeComponents, (typeof LevelEntityComponents)[number]>

export function isCollisionWithCapture(
    collision: CollisionMessage,
    other: Entity<RuntimeComponents>,
): other is LevelEntity {
    return (
        collision.other?.has(...LevelEntityComponents) &&
        collision.other.components.level.captureCollider.handle ===
            collision.otherCollider.handle &&
        collision.other.components.level.captured === false
    )
}

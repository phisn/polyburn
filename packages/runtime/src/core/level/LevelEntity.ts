import { Entity } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { CollisionMessage } from "../collision/CollisionMessage"
import { RuntimeComponents } from "../RuntimeComponents"

export const LevelEntityComponents = [
    "level",
    "entityType",
    "rigidBody",
] as const

export type LevelEntity = EntityWith<
    RuntimeComponents,
    (typeof LevelEntityComponents)[number]
>

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

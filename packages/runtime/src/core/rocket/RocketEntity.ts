import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { RuntimeComponents } from "../RuntimeComponents"

export const RocketEntityComponents = ["rocket", "rigidBody", "moving"] as const

export type RocketEntity = EntityWith<RuntimeComponents, typeof RocketEntityComponents[number]>

export function updateCurrentLevel(entity: RocketEntity, level: EntityWith<RuntimeComponents, "level">) {
    entity.components.rocket.currentLevel.components.level.boundsCollider.setSensor(true)
    entity.components.rocket.currentLevel = level
    entity.components.rocket.currentLevel.components.level.boundsCollider.setSensor(false)

    entity.components.rocket.spawnPosition = entity.components.rigidBody.translation()
    entity.components.rocket.spawnRotation = entity.components.rigidBody.rotation()
}

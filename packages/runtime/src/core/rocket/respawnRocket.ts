import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { RuntimeComponents } from "../RuntimeComponents"

export function respawnRocket(entity: EntityWith<RuntimeComponents, "rocket" | "rigidBody">) {
    entity.components.rigidBody.setTranslation(entity.components.rocket.spawnPosition, true)
    entity.components.rigidBody.setRotation(entity.components.rocket.spawnRotation, true)

    entity.components.rigidBody.setLinvel({ x: 0, y: 0 }, true)
    entity.components.rigidBody.setAngvel(0, true)
}

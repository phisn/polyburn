import { Entity, EntityWith } from "runtime-framework"

import { LevelEntity } from "../level/LevelEntity"
import {
    RocketEntityComponents,
    updateCurrentLevel as updateRocketCurrentLevel,
} from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureInProgressSystem: RuntimeSystemFactory = ({
    store,
    messageStore,
}) => {
    const entities = store.newSet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            entity.components.levelCapturing.timeToCapture -= 1

            if (entity.components.levelCapturing.timeToCapture <= 0) {
                const velocity = entity.components.rigidBody.linvel()

                if (
                    Math.abs(velocity.x) > 0.0001 ||
                    Math.abs(velocity.y) > 0.0001
                ) {
                    entity.components.levelCapturing.timeToCapture = 100
                    continue
                }

                const level = entity.components.levelCapturing.level

                finishCapture(entity, level)
                updateRocketCurrentLevel(entity, level)

                messageStore.publish("levelCaptured", {
                    level: level,
                    rocket: entity,
                })
            }
        }
    }

    function finishCapture(
        entity: EntityWith<RuntimeComponents, "levelCapturing">,
        level: LevelEntity,
    ) {
        level.components.level.inCapture = false
        level.components.level.captured = true

        delete (entity as Entity<RuntimeComponents>).components.levelCapturing
    }
}

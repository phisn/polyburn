import { Entity, EntityWith } from "runtime-framework"

import { LevelEntity } from "../level/level-entity"
import {
    RocketEntityComponents,
    updateCurrentLevel as updateRocketCurrentLevel,
} from "../rocket/rocket-entity"
import { RuntimeComponents } from "../runtime-components"
import { RuntimeSystemFactory } from "../runtime-system-factory"

export const newLevelCaptureInProgressSystem: RuntimeSystemFactory = ({ store, messageStore }) => {
    const entities = store.newSet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            if (entity.components.levelCapturing.timeToCapture <= 0) {
                const velocity = entity.components.rigidBody.linvel()

                if (Math.abs(velocity.x) > 0.001 || Math.abs(velocity.y) > 0.001) {
                    continue
                }

                const level = entity.components.levelCapturing.level

                finishCapture(entity, level)
                updateRocketCurrentLevel(entity, level)

                messageStore.publish("levelCaptured", {
                    level: level,
                    rocket: entity,
                })
            } else {
                entity.components.levelCapturing.timeToCapture -= 1
            }
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

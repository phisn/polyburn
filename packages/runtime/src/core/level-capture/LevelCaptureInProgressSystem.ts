
import { Entity } from "runtime-framework"

import { RocketEntityComponents, updateCurrentLevel } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureInProgressSystem: RuntimeSystemFactory = ({ store, messageStore }) => {
    const entities = store.newSet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            entity.components.levelCapturing.timeToCapture -= 1

            if (entity.components.levelCapturing.timeToCapture <= 0) {
                messageStore.publish("finished", {})

                entity.components.levelCapturing.level.components.level.inCapture = false
                entity.components.levelCapturing.level.components.level.captured = true
                
                updateCurrentLevel(entity, entity.components.levelCapturing.level)

                delete (entity as Entity<RuntimeComponents>).components.levelCapturing
            }
        }
    }
}

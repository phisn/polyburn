
import { Entity } from "runtime-framework"

import { RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureTimerSystem: RuntimeSystemFactory = (store) => {
    const entities = store.getState().newEntitySet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            entity.components.levelCapturing.timeToCapture -= 1

            if (entity.components.levelCapturing.timeToCapture <= 0) {
                entity.components.levelCapturing.level.components.level.captured = true
                entity.components.rocket.currentLevel = entity.components.levelCapturing.level

                delete (entity as Entity<RuntimeComponents>).components.levelCapturing
            }
        }
    }
}

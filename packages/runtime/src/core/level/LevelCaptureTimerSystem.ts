
import { Entity } from "runtime-framework"

import { RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureTimerSystem: RuntimeSystemFactory = (store) => {
    const entities = store.getState().newEntitySet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            entity.components.levelCapturing.timeToCapture -= 1
            console.log(`capturing ${entity.components.levelCapturing.timeToCapture}`)

            if (entity.components.levelCapturing.timeToCapture <= 0) {
                entity.components.rocket.currentLevel.components.level.boundsCollider.setSensor(true)
                entity.components.rocket.currentLevel = entity.components.levelCapturing.level
                entity.components.rocket.currentLevel.components.level.boundsCollider.setSensor(false)

                delete (entity as Entity<RuntimeComponents>).components.levelCapturing
            }
        }
    }
}

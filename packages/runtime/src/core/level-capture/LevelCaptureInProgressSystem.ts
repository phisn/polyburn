
import { Entity } from "runtime-framework"

import { RocketEntityComponents, updateCurrentLevel } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureInProgressSystem: RuntimeSystemFactory = (store) => {
    const entities = store.newEntitySet("levelCapturing", ...RocketEntityComponents)

    return () => {
        for (const entity of entities) {
            entity.components.levelCapturing.timeToCapture -= 1

            if (entity.components.levelCapturing.timeToCapture <= 0) {
                updateCurrentLevel(entity, entity.components.levelCapturing.level)

                delete (entity as Entity<RuntimeComponents>).components.levelCapturing
            }
        }
    }
}

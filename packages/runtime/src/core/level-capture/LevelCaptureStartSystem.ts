import { Entity } from "runtime-framework"

import { isCollisionWithCapture, LevelEntity } from "../level/LevelEntity"
import { RocketEntity, RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureStartSystem: RuntimeSystemFactory = ({ messageStore }) => {
    const collisions = messageStore.collectTarget("collision", ...RocketEntityComponents)

    return () => {
        for (const collision of collisions) {
            if (isCollisionWithCapture(collision, collision.other)) {
                if (collision.started) {
                    startCapture(collision.target, collision.other)
                } else {
                    stopCapture(collision.target, collision.other)
                }
            }
        }
    }
}

function startCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    rocketEntity.components.levelCapturing = {
        level,
        timeToCapture: 60,
    }

    level.components.level.inCapture = true
}

function stopCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    if (rocketEntity.has("levelCapturing")) {
        level.components.level.inCapture = false

        delete (rocketEntity as Entity<RuntimeComponents>).components.levelCapturing
    }
}

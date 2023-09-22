import { Entity } from "runtime-framework"

import { isCollisionWithCapture, LevelEntity } from "../level/level-entity"
import { RocketEntity, RocketEntityComponents } from "../rocket/rocket-entity"
import { RuntimeComponents } from "../runtime-components"
import { RuntimeSystemFactory } from "../runtime-system-factory"

export const newLevelCaptureStartSystem: RuntimeSystemFactory = ({ messageStore }) => {
    const collisions = messageStore.collectTarget("collision", ...RocketEntityComponents)

    return () => {
        for (const collision of collisions) {
            if (isCollisionWithCapture(collision, collision.other)) {
                if (collision.started) {
                    if (collision.target.has("levelCapturing")) {
                        collision.target.components.levelCapturing.collidersInside += 1
                    } else {
                        startCapture(collision.target, collision.other)
                    }
                } else {
                    if (collision.target.has("levelCapturing")) {
                        collision.target.components.levelCapturing.collidersInside -= 1

                        if (collision.target.components.levelCapturing.collidersInside <= 0) {
                            stopCapture(collision.target, collision.other)
                        }
                    }
                }
            }
        }
    }
}

function startCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    rocketEntity.components.levelCapturing = {
        level,
        timeToCapture: 60,
        collidersInside: 1,
    }

    level.components.level.inCapture = true
}

function stopCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    if (rocketEntity.has("levelCapturing")) {
        level.components.level.inCapture = false

        delete (rocketEntity as Entity<RuntimeComponents>).components.levelCapturing
    }
}

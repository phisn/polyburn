

import { Entity } from "runtime-framework"

import { isCollisionWithCapture, LevelEntity } from "../level/LevelEntity"
import { RocketEntity, RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureStartSystem: RuntimeSystemFactory = (store) => {
    const entities = store.newEntitySet(...RocketEntityComponents)

    return () => {
        for (const rocketEntity of entities) {
            for (const collisionEvent of rocketEntity.components.collision.events) {
                if (isCollisionWithCapture(collisionEvent, collisionEvent.other)) {

                    if (collisionEvent.started) {
                        startCapture(rocketEntity, collisionEvent.other)
                    }
                    else {
                        stopCapture(rocketEntity, collisionEvent.other)
                    }
                    
                }
            }
        }
    }
}

function startCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    rocketEntity.components.levelCapturing = {
        level,
        timeToCapture: 100
    }

    level.components.level.inCapture = true
}

function stopCapture(rocketEntity: RocketEntity, level: LevelEntity) {
    if (rocketEntity.has("levelCapturing")) {
        level.components.level.inCapture = false
        
        delete (rocketEntity as Entity<RuntimeComponents>).components.levelCapturing
    }
}



import { Entity } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/NarrowComponents"

import { RocketEntity, RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureTriggerSystem: RuntimeSystemFactory = (store) => {
    const entities = store.getState().newEntitySet(...RocketEntityComponents)

    return () => {
        for (const rocketEntity of entities) {
            for (const collisionEvent of rocketEntity.components.collision.events) {
                if (collisionEvent.other?.has("level") &&
                    collisionEvent.other.components.level.captureCollider.handle === collisionEvent.otherColliderHandle) {

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

function startCapture(rocketEntity: RocketEntity, level: EntityWith<RuntimeComponents, "level">) {
    rocketEntity.components.levelCapturing = {
        level,
        timeToCapture: 100
    }

    level.components.level.captured = true
}

function stopCapture(rocketEntity: RocketEntity, level: EntityWith<RuntimeComponents, "level">) {
    if (rocketEntity.has("levelCapturing")) {
        delete (rocketEntity as Entity<RuntimeComponents>).components.levelCapturing
        level.components.level.captured = false
    }
}

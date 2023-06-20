
import { RocketEntityComponents } from "../rocket/RocketEntity"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newLevelCaptureStartSystem: RuntimeSystemFactory = (store) => {
    const entities = store.getState().newEntitySet(...RocketEntityComponents)

    return () => {
        for (const rocketEntity of entities) {
            for (const collisionEvent of rocketEntity.components.collision.events) {
                if (collisionEvent.other?.has("level") &&
                    collisionEvent.otherColliderHandle == collisionEvent.other.components.level.captureCollider.handle) {

                    rocketEntity.components.levelCapturing = {
                        level: collisionEvent.other,
                        timeToCapture: 60
                    }
                }
            }
        }
    }
}

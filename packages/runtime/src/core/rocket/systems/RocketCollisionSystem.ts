import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketEntityComponents } from "../RocketEntity"

export const newRocketCollisionSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet("collisionEvent", ...RocketEntityComponents)

    return (context) => {
        for (const entity of rockets) {
            for (const collision of entity.components.collisionEvent.events) {
                if (collision.sensor) {
                    continue
                }

                if (collision.started) {
                    entity.components.rocket.collisionCount++
                }
                else {
                    entity.components.rocket.collisionCount--
                }

                if (entity.components.rocket.collisionCount == 0) {
                    entity.components.rocket.rotationWithoutInput = entity.components.rigidBody.rotation() - context.rotation
                }
            }

            entity.components.collisionEvent.events = []
        }
    }
}
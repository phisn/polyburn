import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketEntityComponents } from "../RocketEntity"

export const newRocketCollisionSystem: RuntimeSystemFactory = ({ store }) => {
    const rockets = store.newSet("collision", ...RocketEntityComponents)

    return (context) => {
        for (const entity of rockets) {
            for (const collision of entity.components.collision.events) {
                if (collision.sensor) {
                    /*
                    if (collision.other?.has("level") && 
                        collision.otherColliderHandle == collision.other.components.level.captureCollider.handle) {

                        collision.other.components.level.captured = true
                    }
                    */

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
        }
    }
}

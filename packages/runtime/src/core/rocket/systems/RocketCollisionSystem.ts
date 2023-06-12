import {Entity } from "../../../../../runtime-framework/src"
import { RigidBodyComponent } from "../../common/components/RigidBodyComponent"
import { Components } from "../../Components"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketComponent } from "../RocketComponent"

export const newRocketCollisionSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        "rocket",
        "rigidBody",
        "collisionEvent")

    return (context) => {
        for (const entity of rockets) {
            for (const collision of entity.components.collisionEvent.events) {
                if (collision.sensor) {
                    continue
                }

                if (collision.started) {
                    rocket.collisionCount++
                }
                else {
                    rocket.collisionCount--
                }

                if (rocket.collisionCount == 0) {
                    resetInputAfterTakeOff(rocketEntity, rocket)
                }
            }

            collisions.events = []
        }

        function resetInputAfterTakeOff(rocketEntity: Entity, rocket: RocketComponent) {
            const rigid = rocketEntity.getSafe<RigidBodyComponent>(Components.RigidBody)
            rocket.rotationWithoutInput = rigid.body.rotation() - context.rotation
        }
    }
}

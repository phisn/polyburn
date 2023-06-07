import {Entity } from "runtime-framework"

import { CollisionEventComponent } from "../../common/components/CollisionEventComponent"
import { RigidBodyComponent } from "../../common/components/RigidBodyComponent"
import { Components } from "../../Components"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketComponent } from "../RocketComponent"

export const newRocketCollisionSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.RigidBody,
        Components.CollisionEvent)

    return (context) => {
        for (const rocketEntity of rockets) {
            const rocket = rocketEntity.getSafe<RocketComponent>(Components.Rocket)
            const collisions = rocketEntity.getSafe<CollisionEventComponent>(Components.CollisionEvent)

            for (const collision of collisions.events) {
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

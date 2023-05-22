import { RuntimeEntity, RuntimeStore } from "runtime-framework"

import { CollisionEventComponent } from "../../common/components/CollisionEventComponent"
import { RigidbodyComponent } from "../../common/components/RigidbodyComponent"
import { Components } from "../../Components"
import { Meta } from "../../Meta"
import { SystemContext } from "../../SystemContext"
import { SystemFactory } from "../../SystemFactory"
import { RocketComponent } from "../RocketComponent"

export const newRocketCollisionSystem: SystemFactory = (meta: Meta, store: RuntimeStore<SystemContext>) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.Rigidbody,
        Components.CollisionEvent)

    return (context: SystemContext) => {
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

        function resetInputAfterTakeOff(rocketEntity: RuntimeEntity, rocket: RocketComponent) {
            const rigid = rocketEntity.getSafe<RigidbodyComponent>(Components.Rigidbody)
            rocket.rotationWithoutInput = rigid.body.rotation() - context.rotation
        }
    }
}

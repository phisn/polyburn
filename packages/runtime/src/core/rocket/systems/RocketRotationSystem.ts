import { RuntimeStore } from "runtime-framework"

import { RigidbodyComponent } from "../../common/components/RigidbodyComponent"
import { Components } from "../../Components"
import { Meta } from "../../Meta"
import { SystemContext } from "../../SystemContext"
import { SystemFactory } from "../../SystemFactory"
import { RocketComponent } from "../RocketComponent"

export const newRocketRotationSystem: SystemFactory = (meta: Meta, store: RuntimeStore<SystemContext>) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

    return (context: SystemContext) => {
        for (const rocket of rockets) {
            const rocketComponent = rocket.getSafe<RocketComponent>(Components.Rocket)

            if (rocketComponent.collisionCount > 0) {
                continue
            }

            const rigid = rocket.getSafe<RigidbodyComponent>(Components.Rigidbody)

            rigid.body.setRotation(
                rocketComponent.rotationWithoutInput + context.rotation,
                true
            )
        }
    }
}
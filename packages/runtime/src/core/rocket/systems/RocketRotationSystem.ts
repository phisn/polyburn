
import { RigidbodyComponent } from "../../common/components/RigidbodyComponent"
import { Components } from "../../Components"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketComponent } from "../RocketComponent"

export const newRocketRotationSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

    return (context) => {
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
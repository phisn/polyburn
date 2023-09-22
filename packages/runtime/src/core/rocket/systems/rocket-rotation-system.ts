import { RuntimeSystemFactory } from "../../runtime-system-factory"
import { RocketEntityComponents } from "../rocket-entity"

export const newRocketRotationSystem: RuntimeSystemFactory = ({ store }) => {
    const rockets = store.newSet(...RocketEntityComponents)

    return context => {
        for (const entity of rockets) {
            if (entity.components.rocket.collisionCount > 0) {
                continue
            }

            entity.components.rigidBody.setRotation(
                entity.components.rocket.rotationWithoutInput + context.rotation,
                true,
            )
        }
    }
}

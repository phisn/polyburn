
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newRocketRotationSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        "rocket",
        "rigidBody")

    return (context) => {
        for (const entity of rockets) {
            if (entity.components.rocket.collisionCount > 0) {
                continue
            }

            entity.components.rigidBody.setRotation(
                entity.components.rocket.rotationWithoutInput + context.rotation,
                true
            )
        }
    }
}
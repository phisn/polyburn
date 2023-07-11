import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newRocketCollisionSystem: RuntimeSystemFactory = ({
    messageStore,
}) => {
    const collisions = messageStore.collectTarget(
        "collision",
        "rocket",
        "rigidBody",
    )

    return context => {
        for (const collision of collisions) {
            if (collision.otherCollider.isSensor()) {
                continue
            }

            if (collision.started) {
                collision.target.components.rocket.collisionCount++
            } else {
                collision.target.components.rocket.collisionCount--
            }

            if (collision.target.components.rocket.collisionCount == 0) {
                collision.target.components.rocket.rotationWithoutInput =
                    collision.target.components.rigidBody.rotation() -
                    context.rotation
            }
        }
    }
}

import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketEntityComponents } from "../RocketEntity"
import { rocketGroundRay } from "../rocketGroundRay"

export const newRocketThrustSystem: RuntimeSystemFactory = ({
    config,
    store,
    physics,
}) => {
    const rockets = store.newSet(...RocketEntityComponents)

    return context => {
        if (!context.thrust) {
            return
        }

        const force = {
            x: 0,
            y: config.thrustValue,
        }

        for (const rocket of rockets) {
            if (
                rocketGroundRay(
                    physics,
                    rocket.components.rigidBody,
                    config.thrustDistance,
                )
            ) {
                force.x *= config.thrustGroundMultiplier
                force.y *= config.thrustGroundMultiplier
            }

            const rotation = rocket.components.rigidBody.rotation()

            const rotatedForce = {
                x: force.x * cos(rotation) - force.y * sin(rotation),
                y: force.x * sin(rotation) + force.y * cos(rotation),
            }

            rocket.components.rigidBody.applyImpulse(rotatedForce, true)
        }
    }
}

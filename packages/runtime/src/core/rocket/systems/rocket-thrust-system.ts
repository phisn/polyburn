import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { RuntimeSystemFactory } from "../../runtime-system-factory"
import { RocketEntityComponents } from "../rocket-entity"
import { rocketGroundRay } from "../rocket-ground-ray"

export const newRocketThrustSystem: RuntimeSystemFactory = ({ config, store, physics, rapier }) => {
    const rockets = store.newSet(...RocketEntityComponents)

    return context => {
        for (const rocket of rockets) {
            rocket.components.rocket.thrusting = context.thrust

            if (!context.thrust) {
                continue
            }

            const force = {
                x: 0,
                y: config.thrustValue,
            }

            if (
                rocketGroundRay(rapier, physics, rocket.components.rigidBody, config.thrustDistance)
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

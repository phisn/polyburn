import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { RocketEntityComponents } from "../RocketEntity"
import { rocketGroundRay } from "../rocketGroundRay"

const thrustValue = 7.3
const thrustGroundMultiplier = 1.3

export const newRocketThrustSystem: RuntimeSystemFactory = (store, meta) => {
    const rockets = store.newEntitySet(...RocketEntityComponents)

    return (context) => {
        if (!context.thrust) {
            return
        }
    
        const force = {
            x: 0,
            y: thrustValue
        }
    
        for (const rocket of rockets) {
            if (rocketGroundRay(meta.rapier, rocket.components.rigidBody)) {
                force.x *= thrustGroundMultiplier
                force.y *= thrustGroundMultiplier

                console.log("ground")
            }
    
            const rotation = rocket.components.rigidBody.rotation()
    
            const rotatedForce = {
                x: force.x * cos(rotation) - force.y * sin(rotation),
                y: force.x * sin(rotation) + force.y * cos(rotation)
            }
    
            rocket.components.rigidBody.applyImpulse(rotatedForce, true)
        }
    }
}

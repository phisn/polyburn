import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { RigidbodyComponent } from "../../common/components/RigidbodyComponent"
import { Components } from "../../Components"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { rocketGroundRay } from "../rocketGroundRay"

const thrustValue = 7.3
const thrustGroundMultiplier = 1.3

export const newRocketThrustSystem: RuntimeSystemFactory = (store, meta) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

    return (context) => {
        if (!context.thrust) {
            return
        }
    
        const force = {
            x: 0,
            y: thrustValue
        }
    
        for (const rocket of rockets) {
            const rigid = rocket.getSafe<RigidbodyComponent>(Components.Rigidbody)

            if (rocketGroundRay(meta.rapier, rigid.body)) {
                force.x *= thrustGroundMultiplier
                force.y *= thrustGroundMultiplier
            }
    
            const rotation = rigid.body.rotation()
    
            const rotatedForce = {
                x: force.x * cos(rotation) - force.y * sin(rotation),
                y: force.x * sin(rotation) + force.y * cos(rotation)
            }
    
            rigid.body.applyImpulse(rotatedForce, true)
        }
    }
}

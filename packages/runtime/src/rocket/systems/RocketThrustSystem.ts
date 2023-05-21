import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import { RuntimeStore } from "runtime-framework"

import { Components } from "../../core/Components"
import { Meta } from "../../core/Meta"
import { SystemContext } from "../../core/SystemContext"
import { rocketGroundRay } from "../rocketGroundRay"
import { RigidbodyComponent } from "./../../core/components/RigidbodyComponent"

const thrustValue = 7.3
const thrustGroundMultiplier = 1.3

export const newRocketThrustSystem = (meta: Meta, store: RuntimeStore<SystemContext>) => {
    const rockets = store.newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

    return (context: SystemContext) => {
        if (context.thrust === false) {
            return
        }
    
        const force = {
            x: 0,
            y: thrustValue
        }
    
        for (const rocket of rockets) {
            const rigid = rocket.get<RigidbodyComponent>(Components.Rigidbody)

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

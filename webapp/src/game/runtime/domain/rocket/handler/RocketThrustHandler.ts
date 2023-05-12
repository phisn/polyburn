import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { RuntimeState } from "../../../RuntimeState"
import { StepContext } from "../../../StepContext"
import { rocketGroundRay } from "../rocketGroundRay"

const thrustValue = 7.3
const thrustGroundMultiplier = 1.3

export function handleRocketThrust(runtime: RuntimeState, context: StepContext): void {
    if (context.thrust === false) {
        return
    }

    const force = {
        x: 0,
        y: thrustValue
    }

    if (rocketGroundRay(runtime.meta.rapier, runtime.rocket.body)) {
        force.x *= thrustGroundMultiplier
        force.y *= thrustGroundMultiplier
    }

    const rotation = runtime.rocket.body.rotation()

    const rotatedForce = {
        x: force.x * cos(rotation) - force.y * sin(rotation),
        y: force.x * sin(rotation) + force.y * cos(rotation)
    }

    runtime.rocket.body.applyImpulse(rotatedForce, true)
}

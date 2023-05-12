import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"

import { RuntimeState } from "../../../RuntimeState"
import { StepContext } from "../../../StepContext"

export function handleRocketCollisions(
    runtime: RuntimeState,
    context: StepContext
) {
    if (runtime.rocket.collisionCount > 0) {
        for (let i = 0; i < runtime.rocket.body.numColliders(); i++) {
            runtime.meta.rapier.contactsWith(
                runtime.rocket.body.collider(i),
                (collider) => {
                    if (collider.isSensor()) {
                        return
                    }

                    runtime.meta.rapier.contactPair(
                        runtime.rocket.body.collider(i),
                        collider,
                        (contact, flipped) => {
                            handleRocketContact(runtime, contact, flipped)
                        }
                    )
                }
            )
        }
    }
}

function handleRocketContact(
    runtime: RuntimeState,
    contact: RAPIER.TempContactManifold, 
    flipped: boolean
) {
    const upVector = {
        x: -sin(runtime.rocket.body.rotation()),
        y: cos(runtime.rocket.body.rotation())
    }

    const otherNormal = flipped
        ? contact.localNormal1()
        : contact.localNormal2()

    const otherNormalLength = sqrt(
        otherNormal.x * otherNormal.x + 
        otherNormal.y * otherNormal.y
    )

    const otherNormalNormalized = {
        x: otherNormal.x / otherNormalLength,
        y: otherNormal.y / otherNormalLength
    }

    const dx = otherNormalNormalized.x - upVector.x
    const dy = otherNormalNormalized.y - upVector.y

    const distance = sqrt(dx * dx + dy * dy)

    if (distance > 0.3) {
        runtime.rocket.respawn()
    }
}
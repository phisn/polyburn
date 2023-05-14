import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { changeAnchor } from "../../../../../common/math"
import { entityModels } from "../../../../../model/world/EntityModels"
import { EntityType } from "../../../../../model/world/EntityType"
import { Point } from "../../../../../model/world/Point"
import { scale } from "../../../../../model/world/Size"
import { RuntimeState } from "../../../RuntimeState"
import { StepContext } from "../../../StepContext"
import { RuntimeParticle } from "../RuntimeParticle"

export function handleRocketThrustParticleHandler(
    runtime: RuntimeState,
    context: StepContext
) {
    if (context.thrust === false) {
        return
    }
    
    const entry = entityModels[EntityType.Rocket]
    const size = scale(entry.size, entry.scale)

    const rotation = runtime.rocket.body.rotation()

    const rocketBottom = changeAnchor(
        runtime.rocket.body.translation(),
        rotation,
        size,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.8 }
    )

    const randomAngle = Math.random() * Math.PI / 4 - Math.PI / 8
    const randomThrustAngle = rotation + randomAngle

    const velocity = 1

    const velocityVector = ({
        x: - sin(randomThrustAngle) * velocity,
        y: + cos(rotation) * velocity
    })

    runtime.particles.push(newThrustParticle(
        runtime,
        rocketBottom,
        velocityVector
    ))
}

function newThrustParticle(
    runtime: RuntimeState,
    position: Point,
    velocity: Point
) {
    return new RuntimeParticle(
        runtime.meta,
        position,
        velocity,
        0.1,
        20)
}

import { EntityWith } from "runtime-framework/src/NarrowProperties"
import { MathUtils } from "three"

import { WebappComponents } from "../WebappComponents"

export type InterpolatedEntity = EntityWith<WebappComponents, "interpolation" | "rigidBody">

export const interpolationThreshold = 0.25

export function interpolateEntity(entity: InterpolatedEntity, delta: number) {
    entity.components.interpolation.position.set(
        MathUtils.lerp(
            entity.components.interpolation.previousPosition.x,
            entity.components.interpolation.newPosition.x,
            delta,
        ),
        MathUtils.lerp(
            entity.components.interpolation.previousPosition.y,
            entity.components.interpolation.newPosition.y,
            delta,
        ),
        0,
    )

    entity.components.interpolation.rotation = MathUtils.lerp(
        entity.components.interpolation.previousRotation,
        entity.components.interpolation.newRotation,
        delta,
    )
}

export function updateInterpolatedEntity(entity: InterpolatedEntity) {
    if (entity.components.rigidBody.isSleeping()) {
        return
    }

    const position = entity.components.rigidBody.translation()

    if (
        Math.abs(entity.components.interpolation.newPosition.x - position.x) >
            interpolationThreshold ||
        Math.abs(entity.components.interpolation.newPosition.y - position.y) >
            interpolationThreshold
    ) {
        console.log("resetting interpolation")
        entity.components.interpolation.previousPosition.set(position.x, position.y, 0)
        entity.components.interpolation.previousRotation = entity.components.rigidBody.rotation()
    } else {
        entity.components.interpolation.previousPosition.set(
            entity.components.interpolation.newPosition.x,
            entity.components.interpolation.newPosition.y,
            0,
        )

        entity.components.interpolation.previousRotation =
            entity.components.interpolation.newRotation
    }

    entity.components.interpolation.newPosition.set(position.x, position.y, 0)
    entity.components.interpolation.newRotation = entity.components.rigidBody.rotation()
}

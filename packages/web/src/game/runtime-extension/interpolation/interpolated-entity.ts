import { EntityWith } from "runtime-framework/src/narrow-properties"
import { MathUtils } from "three"

import { WebappComponents } from "../webapp-components"

export type InterpolatedEntity = EntityWith<WebappComponents, "interpolation">

export const interpolationThreshold = 1

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
    if (entity.components.interpolation.currentActive() === false) {
        return
    }

    const position = entity.components.interpolation.currentTranslation()

    if (
        Math.abs(entity.components.interpolation.newPosition.x - position.x) >
            interpolationThreshold ||
        Math.abs(entity.components.interpolation.newPosition.y - position.y) >
            interpolationThreshold
    ) {
        console.log("resetting interpolation")

        entity.components.interpolation.previousPosition.set(position.x, position.y, 0)
        entity.components.interpolation.previousRotation =
            entity.components.interpolation.currentRotation()
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
    entity.components.interpolation.newRotation = entity.components.interpolation.currentRotation()
}

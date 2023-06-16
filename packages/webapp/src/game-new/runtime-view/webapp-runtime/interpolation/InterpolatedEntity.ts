import { EntityWith } from "runtime-framework/src/NarrowComponents"
import { MathUtils } from "three"

import { WebappComponents } from "../WebappComponents"

export type InterpolatedEntity = EntityWith<WebappComponents, "interpolation">

export function interpolateEntity(entity: InterpolatedEntity, delta: number) {
    entity.components.interpolation.position.set(
        MathUtils.lerp(
            entity.components.interpolation.previousPosition.x,
            entity.components.interpolation.newPosition.x,
            delta
        ),
        MathUtils.lerp(
            entity.components.interpolation.previousPosition.y,
            entity.components.interpolation.newPosition.y,
            delta
        ),
        0
    )

    entity.components.interpolation.rotation = MathUtils.lerp(
        entity.components.interpolation.previousRotation,
        entity.components.interpolation.newRotation,
        delta
    )
}



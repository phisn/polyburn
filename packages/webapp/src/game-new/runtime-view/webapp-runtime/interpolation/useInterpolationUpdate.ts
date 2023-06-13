import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import { EntityStore } from "runtime-framework"
import { EntityWith } from "runtime-framework/src/NarrowComponents"
import { MathUtils } from "three"

import { WebappComponents } from "../WebappComponents"

export function useInterpolationUpdate(store: EntityStore<WebappComponents>, tickrate: number) {
    const entities = useMemo(() => store.getState().newEntitySet("interpolation", "rigidBody"), [store])

    let previousTime = performance.now()

    useFrame(() => {
        const delta = Math.min(
            (performance.now() - previousTime) / tickrate,
            1.0
        )

        for (const entity of entities) {
            if (entity.components.rigidBody.isSleeping()) {
                continue
            }

            interpolateEntity(entity, delta)
        }
    })

    return {
        onPhysicsUpdate(time: number) {
            for (const entity of entities) {
                if (entity.components.rigidBody.isSleeping()) {
                    continue
                }

                entity.components.interpolation.previousPosition.set(
                    entity.components.interpolation.newPosition.x,
                    entity.components.interpolation.newPosition.y, 0)
                entity.components.interpolation.previousRotation = entity.components.interpolation.newRotation

                const position = entity.components.rigidBody.translation()

                entity.components.interpolation.newPosition.set(position.x, position.y, 0)
                entity.components.interpolation.newRotation = entity.components.rigidBody.rotation()
            }

            previousTime = time
        }
    }
}

function interpolateEntity(entity: EntityWith<WebappComponents, "interpolation">, delta: number) {
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

import { useMemo } from "react"
import { EntityStore } from "runtime-framework"

import { WebappComponents } from "../WebappComponents"
import { interpolateEntity } from "./InterpolatedEntity"

export function useUpdateInterpolation(store: EntityStore<WebappComponents>, tickrate: number) {
    const entities = useMemo(
        () => store.getState().newEntitySet("interpolation", "rigidBody"), 
        [store]
    )

    let previousTime = performance.now()
    
    function onPhysicsUpdate(time: number) {
        previousTime = time

        const delta = Math.min(
            (performance.now() - previousTime) / tickrate,
            1.0
        )

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

            interpolateEntity(entity, delta)
        }
    }

    return {
        onPhysicsUpdate
    }
}

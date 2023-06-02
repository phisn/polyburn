import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import { RigidbodyComponent } from "runtime/src/core/common/components/RigidbodyComponent"
import { Components } from "runtime/src/core/Components"
import { Entity, EntityStore } from "runtime-framework"
import { MathUtils, Vector3 } from "three"

import { AddonComponents } from "../AddonComponents"
import { InterpolationComponent } from "./InterpolationComponent"

export function useInterpolationUpdate(store: EntityStore, tickrate: number) {
    const entities = useMemo(() =>
        store.getState().newEntitySet(
            Components.Rigidbody,
            AddonComponents.Interpolation),
    [store]
    )

    let previousTime = performance.now()

    useFrame(() => {
        const delta = Math.min(
            (performance.now() - previousTime) / tickrate,
            1.0
        )

        for (const entity of entities) {
            const rigid = entity.getSafe<RigidbodyComponent>(Components.Rigidbody)

            if (rigid.body.isSleeping()) {
                continue
            }

            interpolateEntity(entity, rigid, delta)
        }
    })

    const onPhysicsUpdate = (time: number) => {
        for (const entity of entities) {
            const interpolation = entity.getSafe<InterpolationComponent>(AddonComponents.Interpolation)

            interpolation.previousPosition = interpolation.newPosition
            interpolation.previousRotation = interpolation.newRotation

            const rigid = entity.getSafe<RigidbodyComponent>(Components.Rigidbody)
            const position = rigid.body.translation()

            interpolation.newPosition = new Vector3(position.x, position.y)
            interpolation.newRotation = rigid.body.rotation()
        }

        previousTime = time
    }

    return onPhysicsUpdate
}

function interpolateEntity(entity: Entity, delta: number) {
    const interpolation = entity.getSafe<InterpolationComponent>(AddonComponents.Interpolation)

    interpolation.position.set(
        MathUtils.lerp(
            interpolation.previousPosition.x,
            interpolation.newPosition.x,
            delta
        ),
        MathUtils.lerp(
            interpolation.previousPosition.y,
            interpolation.newPosition.y,
            delta
        ),
        0
    )

    interpolation.rotation = MathUtils.lerp(
        interpolation.previousRotation,
        interpolation.newRotation,
        delta
    )
}

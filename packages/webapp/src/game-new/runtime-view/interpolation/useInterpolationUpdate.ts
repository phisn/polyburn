import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import { RigidBodyComponent } from "runtime/src/core/common/components/RigidBodyComponent"
import { Components } from "runtime/src/core/Components"
import { MathUtils } from "three"

import { Entity, EntityStore } from "../../../../../runtime-framework/src"
import { AddonComponents } from "../AddonComponents"
import { InterpolationComponent } from "./InterpolationComponent"

export function useInterpolationUpdate(store: EntityStore, tickrate: number) {
    const entities = useMemo(() =>
        store.getState().newEntitySet(AddonComponents.Interpolation),
    [store]
    )

    let previousTime = performance.now()

    useFrame(() => {
        const delta = Math.min(
            (performance.now() - previousTime) / tickrate,
            1.0
        )

        for (const entity of entities) {
            const rigid = entity.getSafe<RigidBodyComponent>(Components.RigidBody)

            if (rigid.body.isSleeping()) {
                continue
            }

            interpolateEntity(entity, delta)
        }
    })

    return {
        onPhysicsUpdate(time: number) {
            for (const entity of entities) {
                const rigid = entity.getSafe<RigidBodyComponent>(Components.RigidBody)

                if (rigid.body.isSleeping()) {
                    continue
                }

                const interpolation = entity.getSafe<InterpolationComponent>(AddonComponents.Interpolation)

                interpolation.previousPosition.set(
                    interpolation.newPosition.x,
                    interpolation.newPosition.y, 0)
                interpolation.previousRotation = interpolation.newRotation

                const position = rigid.body.translation()

                interpolation.newPosition.set(position.x, position.y, 0)
                interpolation.newRotation = rigid.body.rotation()

                if (Components.Rocket in entity.components) {
                    // console.log(`pp${interpolation.previousPosition.x}|${interpolation.previousPosition.y}, np${interpolation.newPosition.x}|${interpolation.newPosition.y}, p${rigid.body.translation().x}|${rigid.body.translation().y}`)
                }
            }

            previousTime = time
        }
    }
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

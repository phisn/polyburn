import RAPIER from "@dimforge/rapier2d-compat"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { World } from "../../model/world/World"
import { changeAnchor } from "../../utility/math"
import { useGameLoop } from "./useGameLoop"

export interface RuntimeGameWorldProps {
    world: World
}

export function RuntimeGameWorld(props: RuntimeGameWorldProps) {
    const rapier = new RAPIER.World({ x: 0.0, y: -9.81 * 4 })

    props.world.shapes.forEach(() =>
        void 0
    )

    const rockets = props.world.entities
        .filter(entity => entity.type === EntityType.Rocket)
        .map(rocket => {
            const entry = entities[rocket.type]

            const positionAtCenter = changeAnchor(
                rocket.position,
                rocket.rotation,
                scale(entry.size, entry.scale),
                entry.anchor,
                { x: 0.5, y: 0.5 }
            )

            const body = rapier.createRigidBody(
                RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(positionAtCenter.x, positionAtCenter.y)
                    .setRotation(rocket.rotation)
                    .setCcdEnabled(true)
                    .setAngularDamping(0.05)
            )

            // Points directly taken from svg
            const points = new Float32Array([
                0, 600,   3, 355,   4, 344,   7, 310,  15, 256,  43, 169,
                87,  85, 150,   0, 183,  42, 200,  62, 243, 138, 277, 229,
                291, 297, 296, 334, 300, 600, 300, 600, 190, 502, 110, 502
            ])

            // Move all points by 50% up and 50% left
            for (let i = 0; i < points.length; i += 2) {
                points[i] -= 150
                points[i + 1] -= 300
            }

            const colliderDesc = RAPIER.ColliderDesc.convexHull(points)
                ?.setMass(4)
                ?.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

            if (colliderDesc == null) {
                throw new Error("Failed to create collider")
            }

            const collider = rapier.createCollider(
                colliderDesc,
                body
            )

            return {
                body,
                collider
            }
        })

    useGameLoop(() => {
        rapier.step()


    }, [ rapier ])
    
    return (
        <>
        </>
    )
}
import RAPIER from "@dimforge/rapier2d-compat"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { Entity } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { changeAnchor } from "../../utility/math"

const rawRocketColliders = [
    [
        1, 502,
        3, 355,
        5, 324,
        11, 284,
        32, 202,
        74, 108,
        117, 42,
        150, 0,
        183, 42,
        226, 108,
        268, 202,
        289, 284,
        295, 324,
        297, 355,
        299, 502
    ],
    [
        300, 600,
        190, 502,
        299, 502
    ],
    [
        0, 600,
        1, 502,
        110, 502
    ]
]

const entry = entities[EntityType.Rocket]

const rocketColliders = rawRocketColliders.map(s => s.map((v, i) => {
    const moved = i % 2 === 0 
        ? v - entry.size.width / 2 
        : v - entry.size.height / 2

    const scaled = moved * entry.scale

    return Math.round(scaled * 1000) / 1000
}))

export function createRocketBody(rapier: RAPIER.World, rocket: Entity): RAPIER.RigidBody {
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
            .setRotation(rocket.rotation + Math.PI)
            .setCcdEnabled(true)
            .setAngularDamping(0.05)
    )

    rocketColliders.forEach(vertices => {
        const collider = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider == null) {
            throw new Error("Failed to create collider")
        }

        collider.setMass(4)
        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

        rapier.createCollider(collider, body)
    })

    return body
}

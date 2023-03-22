import RAPIER from "@dimforge/rapier2d-compat"

import { entities } from "../../model/world/Entities"
import { Entity  } from "../../model/world/Entity"
import { EntityType } from "../../model/world/EntityType"
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

export const rocketColliders = rawRocketColliders.map(s => s.map((v, i) => {
    const moved = i % 2 === 0 
        ? v - entry.size.width / 2 
        : entry.size.height / 2 - v

    const scaled = moved * entry.scale

    return Math.round(scaled * 1000) / 1000
}))

export interface SimulationRocket {
    body: RAPIER.RigidBody
    rotation: number
    collisionCount: number
}

export function createRocketBody(rapier: RAPIER.World, rocket: Entity) {
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

    rocketColliders.forEach((vertices, i) => {
        const collider = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider == null) {
            throw new Error("Failed to create collider")
        }

        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setMass(i === 0 ? 20 : 0.5)

        rapier.createCollider(collider, body)
    })

    console.log("Body mass: " + body.mass())

    return body
}


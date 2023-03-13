import RAPIER from "@dimforge/rapier2d-compat"
import { entities } from "../../../model/world/Entities"

import { Entity, EntityType } from "../../../model/world/Entity"
import { scale } from "../../../model/world/Size"
import { World } from "../../../model/world/World"
import { changeAnchor } from "../../../utility/math"
import { rocketCollider, rocketColliders } from "./rocketCollider"

interface Simulation {
    rapier: RAPIER.World

    rockets: RAPIER.RigidBody[]

    step(): void
}

function createRocketBody(rapier: RAPIER.World, rocket: Entity): RAPIER.RigidBody {
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

    rocketColliders.forEach(vertices => {
        const collider = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider == null) {
            throw new Error("Failed to create collider")
        }

        collider.setMass(0)
        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

        rapier.createCollider(collider, body)
    })

    return body
}

function createSimulation(world: World): Simulation {
    const rapier = new RAPIER.World({ x: 0.0, y: -9.81 * 4 })

    world.entities
        .filter(entity => entity.type === EntityType.Rocket)
        .map(

    return {
        rapier,

        step: () => rapier.step(),
    }
}

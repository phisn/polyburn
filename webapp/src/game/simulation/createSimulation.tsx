import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { World } from "../../model/world/World"
import { changeAnchor } from "../../utility/math"
import { createRocket, SimulationRocket } from "./createRocket"
import { createShape } from "./createShape"
import { UpdateContext as StepContext } from "./StepContext"

export interface Simulation {
    rapier: RAPIER.World

    rockets: SimulationRocket[]

    step(context: StepContext): void
}

export function createSimulation(world: World): Simulation {
    const rapier = new RAPIER.World({ x: 0.0, y: -12 })

    const rockets = world.entities
        .filter(entity => entity.type === EntityType.Rocket)
        .map(entity => createRocket(rapier, entity))

    world.shapes.forEach(shape => 
        createShape(shape, rapier)
    )

    const rocketGroundRayRaw = (rocket: RAPIER.RigidBody) => {
        const entry = entities[EntityType.Rocket]
        const size = scale(entry.size, entry.scale)

        const rayStart = changeAnchor(
            rocket.translation(),
            rocket.rotation(),
            size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.2 }
        )

        const rayTarget = changeAnchor(
            rocket.translation(),
            rocket.rotation(),
            size,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: -1 }
        )

        const rayDir = new RAPIER.Vector2(
            rayTarget.x - rayStart.x,
            rayTarget.y - rayStart.y
        )

        const length = Math.sqrt(rayDir.x * rayDir.x + rayDir.y * rayDir.y)
        const ray = new RAPIER.Ray(rayStart, rayDir)

        const cast = rapier.castRay(
            ray,
            1,
            false,
            undefined,
            undefined,
            undefined,
            rocket
        )

        return {
            cast,
            ray,
            rayStart,
            rayTarget
        }
    }

    const rocketGroundRay = (rocket: RAPIER.RigidBody) => 
        rocketGroundRayRaw(rocket)?.cast

    const queue = new RAPIER.EventQueue(true)

    const bodyHandleToRocket = new Map<RAPIER.RigidBodyHandle, SimulationRocket>(
        rockets.map(rocket => [rocket.body.handle, rocket])
    )

    return {
        rapier,
        rockets,

        step: (context: StepContext) => {
            rockets.forEach(rocket => {
                if (rocket.collisionCount === 0) {
                    rocket.body.setRotation(
                        rocket.rotation + context.rotation,
                        true
                    )
                }
                
                if (context.thrust) {
                    const force = {
                        x: 0,
                        y: 0.825
                    }
                
                    if (rocketGroundRay(rocket.body)) {
                        force.x *= 1.3
                        force.y *= 1.3
                    }

                    const rotation = rocket.body.rotation()
                
                    const rotatedForce = {
                        x: force.x * cos(rotation) - force.y * sin(rotation),
                        y: force.x * sin(rotation) + force.y * cos(rotation)
                    }

                    rocket.body.applyImpulse(rotatedForce, true)
                }
            })

            rapier.step(queue)

            queue.drainCollisionEvents((h1, h2, started) => {
                const parent1 = rapier.getCollider(h1).parent()
                const parent2 = rapier.getCollider(h2).parent()

                const rocket1 = parent1 && bodyHandleToRocket.get(parent1.handle)
                const rocket2 = parent2 && bodyHandleToRocket.get(parent2.handle)

                if (rocket1) {
                    rocket1.collisionCount += started ? 1 : -1
                    
                    if (rocket1.collisionCount === 0) {
                        rocket1.rotation = rocket1.body.rotation() - context.rotation
                    }
                }

                if (rocket2) {
                    rocket2.collisionCount += started ? 1 : -1

                    if (rocket2.collisionCount === 0) {
                        rocket2.rotation = rocket2.body.rotation() - context.rotation
                    }
                }
            })
        },
    }
}

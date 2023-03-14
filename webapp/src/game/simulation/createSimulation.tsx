import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"

import { entities } from "../../model/world/Entities"
import { EntityType } from "../../model/world/Entity"
import { scale } from "../../model/world/Size"
import { World } from "../../model/world/World"
import { changeAnchor } from "../../utility/math"
import { createRocketBody } from "./createRocketBody"
import { createShapeBody } from "./createShapeBody"
import { UpdateContext as StepContext } from "./StepContext"

export interface Simulation {
    rapier: RAPIER.World

    rockets: RAPIER.RigidBody[]

    step(context: StepContext): void
}

export function createSimulation(world: World): Simulation {
    const rapier = new RAPIER.World({ x: 0.0, y: -9.81 * 4 })

    const rockets = world.entities
        .filter(entity => entity.type === EntityType.Rocket)
        .map(entity => createRocketBody(rapier, entity))

    world.shapes.forEach(shape => 
        createShapeBody(shape, rapier)
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

    return {
        rapier,
        rockets,

        step: (context: StepContext) => { 
            if (context.thrust) {
                rockets.forEach(rocket => {
                    const force = {
                        x: 0,
                        y: 2.675
                    }
                    
                    if (rocketGroundRay(rocket)) {
                        force.x *= 1.3
                        force.y *= 1.3
                    }

                    const rotation = rocket.rotation()
                    
                    const rotatedForce = {
                        x: force.x * cos(rotation) - force.y * sin(rotation),
                        y: force.x * sin(rotation) + force.y * cos(rotation)
                    }
 
                    rocket.applyImpulse(rotatedForce, true)
                })

            }
            else {
                console.log(`Applying thrust: ${context.thrust}`)

            }

            console.log("steps:" + 1 / rapier.timestep)
            
            rapier.step()
        },
    }
}

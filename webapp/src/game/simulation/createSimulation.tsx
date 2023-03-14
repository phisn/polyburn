import RAPIER from "@dimforge/rapier2d-compat"

import { EntityType } from "../../model/world/Entity"
import { World } from "../../model/world/World"
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

    return {
        rapier,

        rockets,

        step: (context: StepContext) => { 
            rapier.step()
        },
    }
}

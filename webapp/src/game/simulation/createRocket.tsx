import RAPIER from "@dimforge/rapier2d-compat"

import { RocketEntity } from "../../model/world/Entity"
import { EntityType } from "../../model/world/EntityType"
import { World } from "../../model/world/World"
import { createRocketBody } from "./createRocketBody"

export interface SimulationRocket {
    body: RAPIER.RigidBody
    rotation: number
    collisionCount: number
}

export function createRocket(
    rapier: RAPIER.World, 
    world: World
): SimulationRocket {
    const rocket = world.entities.find(
        entity => entity.type === EntityType.Rocket
    ) as RocketEntity | undefined

    if (!rocket) {
        throw new Error("Rocket not found")
    }

    const body = createRocketBody(rapier, rocket)

    return {
        body,
        rotation: rocket.rotation,
        collisionCount: 0
    }
}

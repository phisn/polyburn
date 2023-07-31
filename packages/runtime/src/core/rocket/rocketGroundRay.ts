import RAPIER from "@dimforge/rapier2d-compat"

import { changeAnchor } from "../../model/changeAnchor"
import { entityModelRegistry } from "../../model/world/EntityModelRegistry"
import { EntityType } from "../common/EntityType"

const rayDir = new RAPIER.Vector2(0, 1)
const ray = new RAPIER.Ray(new RAPIER.Vector2(0, 0), new RAPIER.Vector2(0, 1))

export const rocketGroundRayRaw = (
    physics: RAPIER.World,
    rocket: RAPIER.RigidBody,
    length: number,
) => {
    const entry = entityModelRegistry[EntityType.Rocket]

    const rayStart = changeAnchor(
        rocket.translation(),
        rocket.rotation(),
        entry,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.2 },
    )

    const rayTarget = changeAnchor(
        rocket.translation(),
        rocket.rotation(),
        entry,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: -1 },
    )

    rayDir.x = rayTarget.x - rayStart.x
    rayDir.y = rayTarget.y - rayStart.y

    ray.dir = rayDir
    ray.origin = rayStart

    const cast = physics.castRay(ray, length, false, undefined, 0x0001_0002, undefined, rocket)

    return {
        cast,
        ray,
        rayStart,
        rayTarget,
    }
}

export const rocketGroundRay = (physics: RAPIER.World, rocket: RAPIER.RigidBody, length: number) =>
    rocketGroundRayRaw(physics, rocket, length)?.cast

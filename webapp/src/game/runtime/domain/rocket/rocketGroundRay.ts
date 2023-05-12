import RAPIER from "@dimforge/rapier2d-compat"

import { changeAnchor } from "../../../../common/math"
import { entityModels } from "../../../../model/world/EntityModels"
import { EntityType } from "../../../../model/world/EntityType"
import { scale } from "../../../../model/world/Size"

export const rocketGroundRayRaw = (rapier: RAPIER.World, rocket: RAPIER.RigidBody) => {
    const entry = entityModels[EntityType.Rocket]
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

export const rocketGroundRay = (rapier: RAPIER.World, rocket: RAPIER.RigidBody) => 
    rocketGroundRayRaw(rapier, rocket)?.cast

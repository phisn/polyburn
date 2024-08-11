import RAPIER from "@dimforge/rapier2d"
import { EntityType } from "../../../../proto/world"
import { changeAnchor } from "../../../model/world/change-anchor"
import { entityRegistry } from "../../../model/world/entity-registry"

// cache objects to not recreate them every frame
let rayDirection: RAPIER.Vector | undefined
let ray: RAPIER.Ray | undefined

export function computeGroundRay(
    rapier: typeof RAPIER,
    physics: RAPIER.World,
    rocket: RAPIER.RigidBody,
    length: number,
) {
    return computeGroundRayRaw(rapier, physics, rocket, length)?.cast
}

export function computeGroundRayRaw(
    rapier: typeof RAPIER,
    physics: RAPIER.World,
    rocket: RAPIER.RigidBody,
    length: number,
) {
    const entry = entityRegistry[EntityType.ROCKET]

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

    if (ray === undefined || rayDirection === undefined) {
        rayDirection = new rapier.Vector2(0, 1)
        ray = new rapier.Ray(new rapier.Vector2(0, 0), new rapier.Vector2(0, 1))
    }

    rayDirection.x = rayTarget.x - rayStart.x
    rayDirection.y = rayTarget.y - rayStart.y

    ray.dir = rayDirection
    ray.origin = rayStart

    const cast = physics.castRay(ray, length, false, undefined, 0x00_01_00_02, undefined, rocket)

    return {
        cast,
        ray,
        rayStart,
        rayTarget,
    }
}

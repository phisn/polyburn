import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { RuntimeComponents } from "../../RuntimeComponents"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { respawnRocket } from "../respawnRocket"
import { RocketEntityComponents } from "../RocketEntity"

export const newRocketDeathSystem: RuntimeSystemFactory = ({ store, rapier }) => {
    const rockets = store.newSet(...RocketEntityComponents)

    return () => {
        for (const entity of rockets) {
            if (entity.components.rocket.collisionCount == 0) {
                continue
            }

            for (let i = 0; i < entity.components.rigidBody.numColliders(); ++i) {
                handleRocketCollider(
                    rapier,
                    entity.components.rigidBody.collider(i),
                    entity
                )
            }
        }
    }
}

function handleRocketCollider(
    rapier: RAPIER.World,
    rocketCollider: RAPIER.Collider,
    entity: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
) {
    rapier.contactsWith(
        rocketCollider,
        (collider) => {
            if (collider.isSensor()) {
                return
            }

            rapier.contactPair(
                rocketCollider,
                collider,
                (contact, flipped) => handleRocketContact(
                    contact,
                    flipped,
                    entity
                )
            )
        }
    )
}

function handleRocketContact(
    contact: RAPIER.TempContactManifold,
    flipped: boolean,
    rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">
) {
    const upVector = {
        x: -sin(rocket.components.rigidBody.rotation()),
        y: cos(rocket.components.rigidBody.rotation())
    }

    const otherNormal = flipped
        ? contact.localNormal1()
        : contact.localNormal2()

    const otherNormalLength = sqrt(
        otherNormal.x * otherNormal.x + 
        otherNormal.y * otherNormal.y
    )

    const otherNormalNormalized = {
        x: otherNormal.x / otherNormalLength,
        y: otherNormal.y / otherNormalLength
    }

    const dx = otherNormalNormalized.x - upVector.x
    const dy = otherNormalNormalized.y - upVector.y

    const distance = sqrt(dx * dx + dy * dy)

    if (distance > 0.3) {
        console.warn(`death because ${distance} > 0.3`)
        respawnRocket(rocket)
    }
}

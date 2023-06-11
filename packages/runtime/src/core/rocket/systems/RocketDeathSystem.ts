import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"

import {Entity } from "../../../../../runtime-framework/src"
import { RigidBodyComponent } from "../../common/components/RigidBodyComponent"
import { Components } from "../../Components"
import { Meta } from "../../Meta"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { respawnRocket } from "../respawnRocket"
import { RocketComponent } from "../RocketComponent"

export const newRocketDeathSystem: RuntimeSystemFactory = (store, meta) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.RigidBody)

    return () => {
        for (const rocket of rockets) {
            const rocketComponent = rocket.getSafe<RocketComponent>(Components.Rocket)

            if (rocketComponent.collisionCount == 0) {
                continue
            }

            const rigid = rocket.getSafe<RigidBodyComponent>(Components.RigidBody)

            for (let i = 0; i < rigid.body.numColliders(); ++i) {
                handleRocketCollider(
                    meta,
                    rigid.body.collider(i),
                    rocket
                )
            }
        }
    }
}

function handleRocketCollider(
    meta: Meta,
    collider: RAPIER.Collider,
    rocket: Entity
) {
    meta.rapier.contactsWith(
        collider,
        (collider) => {
            if (collider.isSensor()) {
                return
            }

            meta.rapier.contactPair(
                collider,
                collider,
                (contact, flipped) => handleRocketContact(
                    contact,
                    flipped,
                    rocket
                )
            )
        }
    )
}

function handleRocketContact(
    contact: RAPIER.TempContactManifold,
    flipped: boolean,
    rocket: Entity
) {
    const rigid = rocket.getSafe<RigidBodyComponent>(Components.RigidBody)

    const upVector = {
        x: -sin(rigid.body.rotation()),
        y: cos(rigid.body.rotation())
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
        respawnRocket(rocket)
    }
}

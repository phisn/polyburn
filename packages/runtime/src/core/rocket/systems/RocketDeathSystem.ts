import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { EntityStore,RuntimeEntity } from "runtime-framework"

import { RigidbodyComponent } from "../../common/components/RigidbodyComponent"
import { Components } from "../../Components"
import { Meta } from "../../Meta"
import { SystemFactory } from "../../SystemFactory"
import { respawnRocket } from "../respawnRocket"
import { RocketComponent } from "../RocketComponent"

export const newRocketDeathSystem: SystemFactory = (meta: Meta, store: EntityStore) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket,
        Components.Rigidbody)

    return () => {
        for (const rocket of rockets) {
            const rocketComponent = rocket.getSafe<RocketComponent>(Components.Rocket)

            if (rocketComponent.collisionCount == 0) {
                continue
            }

            const rigid = rocket.getSafe<RigidbodyComponent>(Components.Rigidbody)

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
    rocket: RuntimeEntity
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
    rocket: RuntimeEntity
) {
    const rigid = rocket.getSafe<RigidbodyComponent>(Components.Rigidbody)

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

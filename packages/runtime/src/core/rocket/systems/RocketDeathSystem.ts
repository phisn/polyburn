import RAPIER from "@dimforge/rapier2d-compat"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { RuntimeComponents } from "../../RuntimeComponents"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { respawnRocket } from "../respawnRocket"
import { RocketEntityComponents } from "../RocketEntity"

export const newRocketDeathSystem: RuntimeSystemFactory = ({
    config,
    store,
    physics,
    messageStore,
}) => {
    const rockets = store.newSet(...RocketEntityComponents)

    return () => {
        for (const entity of rockets) {
            entity.components.rocket.framesSinceLastDeath++

            if (entity.components.rocket.collisionCount === 0) {
                continue
            }

            for (let i = 0; i < entity.components.rigidBody.numColliders(); ++i) {
                handleRocketCollider(entity.components.rigidBody.collider(i), entity)
            }
        }
    }

    function handleRocketCollider(
        rocketCollider: RAPIER.Collider,
        entity: EntityWith<RuntimeComponents, "rocket" | "rigidBody">,
    ) {
        physics.contactsWith(rocketCollider, collider => {
            if (collider.isSensor()) {
                return
            }

            physics.contactPair(rocketCollider, collider, (contact, flipped) => {
                // sometimes of the normals are zero (same as numcontacts === 0) but no idea why. if one is zero then the
                // other is is some random vector that causes the rocket to die. therefore we
                // just ignore the contact in this case
                if (contact.numContacts() !== 0) {
                    handleRocketContact(contact, flipped, entity)
                }
            })
        })
    }

    function handleRocketContact(
        contact: RAPIER.TempContactManifold,
        flipped: boolean,
        rocket: EntityWith<RuntimeComponents, "rocket" | "rigidBody">,
    ) {
        const upVector = {
            x: -sin(rocket.components.rigidBody.rotation()),
            y: cos(rocket.components.rigidBody.rotation()),
        }

        const otherNormal = flipped ? contact.localNormal1() : contact.localNormal2()

        const otherNormalLength = sqrt(
            otherNormal.x * otherNormal.x + otherNormal.y * otherNormal.y,
        )

        const otherNormalNormalized = {
            x: otherNormal.x / otherNormalLength,
            y: otherNormal.y / otherNormalLength,
        }

        const dx = otherNormalNormalized.x - upVector.x
        const dy = otherNormalNormalized.y - upVector.y

        const distance = sqrt(dx * dx + dy * dy)

        if (distance > config.explosionAngle && rocket.components.rocket.framesSinceLastDeath > 8) {
            /*
            const numcontactsrange = Array.from({ length: contact.numContacts() }, (_, i) => i)

            console.log(`OK!!
                ln1x ${contact.localNormal1().x} ln1y ${contact.localNormal1().y}
                ln2x ${contact.localNormal2().x} ln2y ${contact.localNormal2().y}
                flipped ${flipped}
                ${numcontactsrange.map(i => `cd${i}: ${contact.contactDist(i)}`).join(" ")}
                ${numcontactsrange
                    .map(i => `cti${i}: ${contact.contactTangentImpulse(i)}`)
                    .join(" ")}
                ${numcontactsrange.map(i => `cni${i}: ${contact.contactImpulse(i)}`).join(" ")}
                nc ${contact.numContacts()}
                rotation: ${rocket.components.rigidBody.rotation()},
                upVector: ${JSON.stringify(upVector)},
                otherNormal: ${JSON.stringify(otherNormal)},
                otherNormalLength: ${otherNormalLength},
                otherNormalNormalized: ${JSON.stringify(otherNormalNormalized)},q
                dx: ${dx},
                dy: ${dy},
                distance: ${distance},
                fsld: ${rocket.components.rocket.framesSinceLastDeath}
            `)
            */

            rocket.components.rocket.framesSinceLastDeath = 0

            messageStore.publish("rocketDeath", {
                position: rocket.components.rigidBody.translation(),
                rotation: rocket.components.rigidBody.rotation(),
                normal: otherNormalNormalized,
            })

            respawnRocket(rocket)
        }
    }
}

import RAPIER from "@dimforge/rapier2d"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { ModuleStore } from "runtime-framework/src/module"
import { RuntimeBehaviors } from "../../behaviors"

export function checkRocketDeath(store: ModuleStore<RuntimeBehaviors>, collider: RAPIER.Collider) {
    const world = store.single("world")().world.rapierWorld

    world.contactsWith(collider, otherCollider => {
        if (otherCollider.isSensor()) {
            return
        }

        world.contactPair(collider, otherCollider, (contact, flipped) => {
            // sometimes of the normals are zero (same as numcontacts === 0) but no idea why. if one is zero then the
            // other is is some random vector that causes the rocket to die. therefore we
            // just ignore the contact in this case
            if (contact.numContacts() !== 0) {
                handleRocketContact(contact, flipped, entity)
            }
        })
    })

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

        const velx = rocket.components.rigidBody.linvel().x
        const vely = rocket.components.rigidBody.linvel().y

        const speedSquare = velx * velx + vely * vely

        const distance = sqrt(dx * dx + dy * dy)

        if (
            (speedSquare > 150 &&
                rocket.components.rocket.framesSinceLastDeath > invincibilityFrames) ||
            (distance > config.explosionAngle &&
                rocket.components.rocket.framesSinceLastDeath > invincibilityFrames)
        ) {
            rocket.components.rocket.framesSinceLastDeath = 0

            const contactPoint = flipped
                ? contact.solverContactPoint(0)
                : contact.solverContactPoint(0)

            for (const listener of store.multiple("onRocketDeath")) {
                listener.onRocketDeath({
                    position: rocket.components.rigidBody.translation(),
                    rotation: rocket.components.rigidBody.rotation(),
                    contactPoint: contactPoint ?? {
                        x: 0,
                        y: 0,
                    },
                    normal: otherNormalNormalized,
                })
            }
        }
    }
}

import RAPIER from "@dimforge/rapier2d"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { ModuleStore } from "runtime-framework/src/module"
import { RocketConfig } from "../../../../proto/world"
import { RuntimeBehaviors } from "../../behaviors"
import { EntityRocket } from "./module-rocket"

const invincibilityFrames = 30

export function checkRocketDeath(props: {
    store: ModuleStore<RuntimeBehaviors>
    rocket: EntityRocket
    config: RocketConfig
    rapierWorld: RAPIER.World
    rigidbody: RAPIER.RigidBody
}) {
    const numColliders = props.rigidbody.numColliders()

    for (let i = 0; i < numColliders; i++) {
        const collider = props.rigidbody.collider(i)

        props.rapierWorld.contactsWith(collider, otherCollider => {
            if (otherCollider.isSensor()) {
                return
            }

            props.rapierWorld.contactPair(collider, otherCollider, (contact, flipped) => {
                // sometimes of the normals are zero (same as numcontacts === 0) but no idea why. if one is zero then the
                // other is is some random vector that causes the rocket to die. therefore we
                // just ignore the contact in this case
                if (contact.numContacts() !== 0) {
                    handleRocketContact(contact, flipped)
                }
            })
        })
    }

    function handleRocketContact(contact: RAPIER.TempContactManifold, flipped: boolean) {
        const upVector = {
            x: -sin(props.rigidbody.rotation()),
            y: cos(props.rigidbody.rotation()),
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

        const velx = props.rigidbody.linvel().x
        const vely = props.rigidbody.linvel().y

        const speedSquare = velx * velx + vely * vely

        const distance = sqrt(dx * dx + dy * dy)

        const canRocketDie = props.rocket.ticksSinceLastDeath > invincibilityFrames

        const isRocketTooFast = speedSquare > 150
        const isRocketTooFar = distance > props.config.explosionAngle

        if (canRocketDie && (isRocketTooFast || isRocketTooFar)) {
            props.rocket.ticksSinceLastDeath = 0

            const contactPoint = flipped
                ? contact.solverContactPoint(0)
                : contact.solverContactPoint(0)

            for (const listener of props.store.multiple("onRocketDeath")) {
                listener.onRocketDeath({
                    position: props.rigidbody.translation(),
                    rotation: props.rigidbody.rotation(),
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

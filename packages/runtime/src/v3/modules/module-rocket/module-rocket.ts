import RAPIER from "@dimforge/rapier2d"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import { ModuleStore } from "runtime-framework/src/module"
import { RocketConfig } from "../../../../proto/world"
import { Point } from "../../../model/point"
import { RuntimeBehaviors, RuntimeInput } from "../../behaviors"
import { checkRocketDeath } from "./check-rocket-death"
import { computeGroundRay } from "./compute-ground-ray"
import { createRocketRigidbody } from "./create-rocket-rigidbody"

export interface ModuleRocketConfig {
    position: Point
    rotation: number
    inner: RocketConfig
}

export interface EntityRocket {
    type: "rocket"
    rigidbody: RAPIER.RigidBody
    thurst: boolean

    ticksSinceLastDeath: number
}

export function moduleRocket(store: ModuleStore<RuntimeBehaviors>, config: ModuleRocketConfig) {
    const rapier = store.single("runtimeDependencies")().runtimeDependencies.rapier
    const world = store.single("world")().world

    const rigidbody = createRocketRigidbody(store, config.position, config.rotation)

    const rocket: EntityRocket = {
        type: "rocket",
        rigidbody,
        thurst: false,

        ticksSinceLastDeath: 0,
    }

    let previousInput: RuntimeInput = { rotation: 0, thrust: false }
    let collisions = 0
    let rotationWithoutInput = 0

    return store.register(
        {
            onRuntimeTick({ input }) {
                rocket.thurst = input.thrust
                rocket.ticksSinceLastDeath++

                if (collisions > 0) {
                    checkRocketDeath({
                        store,
                        rocket,
                        config: config.inner,
                        rapierWorld: world.rapierWorld,
                        rigidbody,
                    })
                }

                if (collisions === 0) {
                    rigidbody.setRotation(rotationWithoutInput + input.rotation, true)
                }

                if (input.thrust) {
                    applyThrust()
                }

                previousInput = input
            },
            onRocketDeath() {
                rigidbody.setTranslation(config.position, false)
                rigidbody.setRotation(config.rotation, false)

                rigidbody.setLinvel({ x: 0, y: 0 }, false)
                rigidbody.setAngvel(0, true)
            },
            entity: rocket,
            collidable: {
                rigidbodyId: rigidbody.handle,
                onCollision({ otherCollider, started }) {
                    if (otherCollider.isSensor()) {
                        return
                    }

                    if (started) {
                        collisions++
                    } else {
                        collisions--
                    }

                    if (collisions === 0) {
                        rotationWithoutInput = rigidbody.rotation() - previousInput.rotation
                    }
                },
            },
        },
        function onDispose() {
            world.rapierWorld.removeRigidBody(rigidbody)
        },
    )

    function applyThrust() {
        const force = {
            x: 0,
            y: config.inner.thrustValue,
        }

        const hit = computeGroundRay(
            rapier,
            world.rapierWorld,
            rigidbody,
            config.inner.thrustDistance,
        )

        if (hit) {
            force.x *= config.inner.thrustGroundMultiplier
            force.y *= config.inner.thrustGroundMultiplier
        }

        const rotation = rigidbody.rotation()

        const rotatedForce = {
            x: force.x * cos(rotation) - force.y * sin(rotation),
            y: force.x * sin(rotation) + force.y * cos(rotation),
        }

        rigidbody.applyImpulse(rotatedForce, true)
    }
}

function _distance(p1: Point, p2: Point) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}

import RAPIER from "@dimforge/rapier2d"
import cos from "@stdlib/math/base/special/cos"
import sin from "@stdlib/math/base/special/sin"
import sqrt from "@stdlib/math/base/special/sqrt"
import { RocketBehaviorConfig } from "../../proto/world"
import { EntityWith } from "../framework/entity"
import { GameInput } from "../game"
import { GameComponents, GameStore } from "../model/store"
import { Point, Size, changeAnchor } from "../model/utils"

export interface RocketComponent {
    behaviorConfig: RocketBehaviorConfig
    collisionCount: number
    framesSinceLastDeath: number
    rotationWithoutInput: number
    spawnPosition: Point
    spawnRotation: number
    thrust: boolean
}

export const rocketComponents = ["rocket", "body"] satisfies (keyof GameComponents)[]
export type RocketEntity = EntityWith<GameComponents, (typeof rocketComponents)[number]>

export class ModuleRocket {
    private firstInput = true
    private getRocket: () => RocketEntity
    private previousInput?: GameInput

    constructor(private store: GameStore) {
        this.getRocket = store.entities.single(...rocketComponents)

        store.events.listen({
            collision: ({ c1, c2, e1, e2, started }) => {
                if (e1?.has(...rocketComponents)) {
                    this.handleCollisionEvent(e1, c2, started)
                }

                if (e2?.has(...rocketComponents)) {
                    this.handleCollisionEvent(e2, c1, started)
                }
            },
            captured: ({ rocket }) => {
                const body = rocket.get("body")
                const rocketComponent = rocket.get("rocket")

                rocketComponent.spawnPosition = {
                    x: body.translation().x,
                    y: body.translation().y,
                }

                rocketComponent.spawnRotation = body.rotation()
            },
        })
    }

    onUpdate({ thrust, rotation }: GameInput) {
        const rocket = this.getRocket()

        const rocketComponent = rocket.get("rocket")
        const body = rocket.get("body")

        if (this.firstInput) {
            this.firstInput = false
            rocketComponent.rotationWithoutInput = -rotation
        }

        rocketComponent.framesSinceLastDeath++
        rocketComponent.thrust = thrust

        if (rocketComponent.collisionCount === 0) {
            body.setRotation(rotation + rocketComponent.rotationWithoutInput, true)
        }

        if (thrust) {
            const rapier = this.store.resources.get("rapier")
            const world = this.store.resources.get("world")

            const force = {
                x: 0,
                y: rocketComponent.behaviorConfig.thrustValue,
            }

            const hasBoost = rocketGroundRay(
                rapier,
                world,
                body,
                rocketComponent.behaviorConfig.thrustDistance,
            )

            if (hasBoost) {
                force.x *= rocketComponent.behaviorConfig.thrustGroundMultiplier
                force.y *= rocketComponent.behaviorConfig.thrustGroundMultiplier
            }

            const rotation = body.rotation()

            const rotatedForce = {
                x: force.x * cos(rotation) - force.y * sin(rotation),
                y: force.x * sin(rotation) + force.y * cos(rotation),
            }

            body.applyImpulse(rotatedForce, true)
        }

        if (rocketComponent.collisionCount > 0) {
            for (let colliderIndex = 0; colliderIndex < body.numColliders(); ++colliderIndex) {
                this.handleActiveCollider(rocket, body.collider(colliderIndex))
            }
        }
    }

    onReset() {
        this.firstInput = true
        this.previousInput = undefined

        for (const rocket of this.store.entities.multipleCopy(...rocketComponents)) {
            this.store.entities.remove(rocket)
        }

        const rocketConfig = this.store.resources.get("config").rocket
        const rapier = this.store.resources.get("rapier")
        const world = this.store.resources.get("world")

        const position = {
            x: rocketConfig.positionX,
            y: rocketConfig.positionY,
        }

        const center = changeAnchor(
            position,
            rocketConfig.rotation,
            ROCKET_SIZE,
            { x: 0, y: 1 },
            { x: 0.5, y: 0.5 },
        )

        const body = world.createRigidBody(
            rapier.RigidBodyDesc.dynamic()
                .setTranslation(center.x, center.y)
                .setRotation(rocketConfig.rotation)
                .setCcdEnabled(true)
                .setAngularDamping(0.05),
        )

        ROCKET_COLLIDERS.forEach((vertices, index) => {
            const collider = rapier.ColliderDesc.convexHull(new Float32Array(vertices))

            if (collider === null) {
                throw new Error("Failed to create collider")
            }

            collider
                .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
                .setMass(index === 0 ? 20 : 0.5)
                .setCollisionGroups(0x00_01_00_02)

            world.createCollider(collider, body)
        })

        this.store.entities.create({
            rocket: {
                behaviorConfig: rocketConfig.defaultConfig ?? DEFAULT_BEHAVIOR_CONFIG,
                collisionCount: 0,
                framesSinceLastDeath: 0,
                rotationWithoutInput: rocketConfig.rotation,
                spawnPosition: {
                    x: body.translation().x,
                    y: body.translation().y,
                },
                spawnRotation: rocketConfig.rotation,
                thrust: false,
            },
            body,
        })
    }

    private handleCollisionEvent(
        rocket: RocketEntity,
        otherCollider: RAPIER.Collider,
        started: boolean,
    ) {
        if (otherCollider.isSensor()) {
            return
        }

        const rocketComponent = rocket.get("rocket")

        if (started) {
            rocketComponent.collisionCount++
        } else {
            rocketComponent.collisionCount--
        }

        if (rocketComponent.collisionCount === 0 && this.previousInput) {
            rocketComponent.rotationWithoutInput =
                rocket.get("body").rotation() - this.previousInput.rotation
        }
    }

    private handleActiveCollider(rocket: RocketEntity, collider: RAPIER.Collider) {
        const world = this.store.resources.get("world")

        world.contactPairsWith(collider, otherCollider => {
            if (otherCollider.isSensor()) {
                return
            }

            world.contactPair(collider, otherCollider, (contact, flipped) => {
                // sometimes of the normals are zero (same as numcontacts === 0) but no idea why. if one is zero then the
                // other is is some random vector that causes the rocket to die. therefore we
                // just ignore the contact in this case
                if (contact.numContacts() !== 0) {
                    this.handleActiveContact(rocket, contact, flipped)
                }
            })
        })
    }

    private handleActiveContact(
        rocket: RocketEntity,
        contact: RAPIER.TempContactManifold,
        flipped: boolean,
    ) {
        const body = rocket.get("body")
        const rocketComponent = rocket.get("rocket")

        const upVector = {
            x: -sin(body.rotation()),
            y: cos(body.rotation()),
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

        const velx = body.linvel().x
        const vely = body.linvel().y

        const speedSquare = velx * velx + vely * vely

        const distance = sqrt(dx * dx + dy * dy)

        const tooFast =
            speedSquare > ROCKET_MAX_SPEED &&
            rocketComponent.framesSinceLastDeath > INVINCIBILITY_FRAMES

        const tooAngled =
            distance > rocketComponent.behaviorConfig.explosionAngle &&
            rocketComponent.framesSinceLastDeath > INVINCIBILITY_FRAMES

        if (tooFast || tooAngled) {
            rocketComponent.framesSinceLastDeath = 0

            const contactPoint = flipped
                ? contact.solverContactPoint(0)
                : contact.solverContactPoint(0)

            this.store.events.invoke.death?.({
                rocket,

                contactPoint: contactPoint ?? {
                    x: 0,
                    y: 0,
                },
                normal: otherNormalNormalized,
            })

            this.respawn(rocket)
        }
    }

    private respawn(rocket: RocketEntity) {
        const body = rocket.get("body")
        const rocketComponent = rocket.get("rocket")

        const rapier = this.store.resources.get("rapier")

        body.setTranslation(
            new rapier.Vector2(rocketComponent.spawnPosition.x, rocketComponent.spawnPosition.y),
            false,
        )
        body.setRotation(rocketComponent.spawnRotation, false)

        body.setLinvel({ x: 0, y: 0 }, false)
        body.setAngvel(0, true)
    }
}

const ROCKET_COLLIDERS = [
    [
        -0.894, -1.212, -0.882, -0.33, -0.87, -0.144, -0.834, 0.096, -0.708, 0.588, -0.456, 1.152,
        -0.198, 1.548, 0, 1.8, 0.198, 1.548, 0.456, 1.152, 0.708, 0.588, 0.834, 0.096, 0.87, -0.144,
        0.882, -0.33, 0.894, -1.212,
    ],
    [0.9, -1.8, 0.24, -1.212, 0.894, -1.212],
    [-0.9, -1.8, -0.894, -1.212, -0.24, -1.212],
]

const INVINCIBILITY_FRAMES = 30

const ROCKET_MAX_SPEED = 150

const DEFAULT_BEHAVIOR_CONFIG: RocketBehaviorConfig = {
    thrustDistance: 1,
    thrustValue: 7.3,
    thrustGroundMultiplier: 1.3,
    explosionAngle: 0.3,
}

export const ROCKET_SIZE: Size = {
    width: 1.8,
    height: 3.6,
}

let rayDirection: RAPIER.Vector | undefined
let ray: RAPIER.Ray | undefined

const rocketGroundRay = (
    rapier: typeof RAPIER,
    world: RAPIER.World,
    rocket: RAPIER.RigidBody,
    length: number,
) => {
    const rayStart = changeAnchor(
        rocket.translation(),
        rocket.rotation(),
        ROCKET_SIZE,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.2 },
    )

    const rayTarget = changeAnchor(
        rocket.translation(),
        rocket.rotation(),
        ROCKET_SIZE,
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

    return world.castRay(ray, length, false, undefined, 0x00_01_00_02, undefined, rocket)
}

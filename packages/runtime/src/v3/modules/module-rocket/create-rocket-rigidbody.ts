import { ModuleStore } from "runtime-framework/src/module"
import { EntityType } from "../../../../proto/world"
import { Point } from "../../../model/point"
import { changeAnchor } from "../../../model/world/change-anchor"
import { entityRegistry } from "../../../model/world/entity-registry"
import { RuntimeBehaviors } from "../../behaviors"

export function createRocketRigidbody(
    store: ModuleStore<RuntimeBehaviors>,
    position: Point,
    rotation: number,
) {
    const dependencyModule = store.single("runtimeDependencies")
    const rapier = dependencyModule().runtimeDependencies.rapier

    const getWorld = store.single("world")

    const entry = entityRegistry[EntityType.ROCKET]

    const positionAtCenter = changeAnchor(
        position,
        rotation,
        entry,
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
    )

    const rigidbody = getWorld().world.rapierWorld.createRigidBody(
        rapier.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rotation)
            .setCcdEnabled(true)
            .setAngularDamping(0.05),
    )

    rocketColliders.forEach((vertices, index) => {
        const collider = rapier.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider === null) {
            throw new Error("Failed to create collider")
        }

        collider
            .setActiveEvents(rapier.ActiveEvents.COLLISION_EVENTS)
            .setMass(index === 0 ? 20 : 0.5)
            .setCollisionGroups(0x00_01_00_02)

        getWorld().world.rapierWorld.createCollider(collider, rigidbody)
    })

    return rigidbody
}

const rocketColliders = [
    [
        -0.894, -1.212, -0.882, -0.33, -0.87, -0.144, -0.834, 0.096, -0.708, 0.588, -0.456, 1.152,
        -0.198, 1.548, 0, 1.8, 0.198, 1.548, 0.456, 1.152, 0.708, 0.588, 0.834, 0.096, 0.87, -0.144,
        0.882, -0.33, 0.894, -1.212,
    ],
    [0.9, -1.8, 0.24, -1.212, 0.894, -1.212],
    [-0.9, -1.8, -0.894, -1.212, -0.24, -1.212],
]

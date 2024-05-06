import { EntityType, RocketModel } from "../../../proto/world"
import { Point } from "../../model/point"
import { changeAnchor } from "../../model/world/change-anchor"
import { entityRegistry } from "../../model/world/entity-registry"
import { RuntimeComponents } from "../runtime-components"
import { RuntimeFactoryContext } from "../runtime-factory-context"
import { RocketEntity } from "./rocket-entity"

export const newRocket = (
    context: RuntimeFactoryContext<RuntimeComponents>,
    rocket: RocketModel,
): RocketEntity => {
    const entry = entityRegistry[EntityType.ROCKET]

    const rocketPosition = {
        x: rocket.positionX,
        y: rocket.positionY,
    }

    const positionAtCenter = changeAnchor(
        rocketPosition,
        rocket.rotation,
        entry,
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 },
    )

    const body = context.physics.createRigidBody(
        context.rapier.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rocket.rotation)
            .setCcdEnabled(true)
            .setAngularDamping(0.05),
    )

    rocketColliders.forEach((vertices, index) => {
        const collider = context.rapier.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider === null) {
            throw new Error("Failed to create collider")
        }

        collider
            .setActiveEvents(context.rapier.ActiveEvents.COLLISION_EVENTS)
            .setMass(index === 0 ? 20 : 0.5)
            .setCollisionGroups(0x00_01_00_02)

        context.physics.createCollider(collider, body)
    })

    const firstLevel = context.store.find("level").reduce((previous, current) => {
        return distance(previous.components.level.flag, rocketPosition) <
            distance(current.components.level.flag, rocketPosition)
            ? previous
            : current
    })

    return context.store.create({
        rocket: {
            thrusting: false,

            collisionCount: 0,
            rotationWithoutInput: rocket.rotation,
            spawnPosition: positionAtCenter,
            spawnRotation: rocket.rotation,

            currentLevel: firstLevel,

            framesSinceLastDeath: 0,
        },

        entityType: EntityType.ROCKET,
        moving: {},
        rigidBody: body,
    })
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

function distance(p1: Point, p2: Point) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}

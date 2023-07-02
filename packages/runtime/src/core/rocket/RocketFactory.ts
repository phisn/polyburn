import RAPIER from "@dimforge/rapier2d-compat"

import { changeAnchor } from "../../model/changeAnchor"
import { RocketEntityModel } from "../../model/world/EntityModel"
import { entityModelRegistry } from "../../model/world/EntityModelRegistry"
import { EntityModelType } from "../../model/world/EntityModelType"
import { Point } from "../../model/world/Point"
import { EntityType } from "../common/EntityType"
import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeFactoryContext } from "../RuntimeFactoryContext"
import { RocketEntity } from "./RocketEntity"

export const newRocket = (context: RuntimeFactoryContext<RuntimeComponents>, rocket: RocketEntityModel): RocketEntity => {
    const entry = entityModelRegistry[EntityModelType.Rocket]
    
    const positionAtCenter = changeAnchor(
        rocket.position,
        rocket.rotation,
        entry,
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 })
        
    const body = context.rapier.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(positionAtCenter.x, positionAtCenter.y)
            .setRotation(rocket.rotation)
            .setCcdEnabled(true)
            .setAngularDamping(0.05))

    rocketColliders.forEach((vertices, i) => {
        const collider = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))

        if (collider === null) {
            throw new Error("Failed to create collider")
        }

        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setMass(i == 0 ? 20 : 0.5)
            .setCollisionGroups(0x0001_0002)

        context.rapier.createCollider(collider, body)
    })

    const distance = (p1: Point, p2: Point) => Math.sqrt(
        (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    )

    const firstLevel = context.store.find("level").reduce((previous, current) => {
        return distance(previous.components.level.flag, rocket.position) < distance(current.components.level.flag, rocket.position)
            ? previous : current
    })

    return context.store.create({
        rocket: {
            collisionCount: 0,
            rotationWithoutInput: rocket.rotation,
            spawnPosition: rocket.position,
            spawnRotation: rocket.rotation,

            currentLevel: firstLevel
        },

        entityType: EntityType.Rocket,
        collision: { events: [] },
        moving: {},
        rigidBody: body,
    })
}

const rocketColliders = [[-0.894,-1.212,-0.882,-0.33,-0.87,-0.144,-0.834,0.096,-0.708,0.588,-0.456,1.152,-0.198,1.548,0,1.8,0.198,1.548,0.456,1.152,0.708,0.588,0.834,0.096,0.87,-0.144,0.882,-0.33,0.894,-1.212],[0.9,-1.8,0.24,-1.212,0.894,-1.212],[-0.9,-1.8,-0.894,-1.212,-0.24,-1.212]]

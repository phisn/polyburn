import RAPIER from "@dimforge/rapier2d-compat"

import { EntityStore } from "../../../../runtime-framework/src"
import { changeAnchor } from "../../model/changeAnchor"
import { RocketEntityModel } from "../../model/world/EntityModel"
import { entityModelRegistry } from "../../model/world/EntityModelRegistry"
import { EntityModelType } from "../../model/world/EntityModelType"
import { EntityType } from "../EntityType"
import { Meta } from "../Meta"
import { RuntimeComponents } from "../RuntimeComponents"

export const newRocket = (meta: Meta, store: EntityStore<RuntimeComponents>, rocket: RocketEntityModel) => {
    const entry = entityModelRegistry[EntityModelType.Rocket]
    
    const positionAtCenter = changeAnchor(
        rocket.position,
        rocket.rotation,
        entry,
        { x: 0, y: 1 },
        { x: 0.5, y: 0.5 })
        
    const body = meta.rapier.createRigidBody(
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

        meta.rapier.createCollider(collider, body)
    })

    return store.getState().newEntity({
        rocket: {
            collisionCount: 0,
            rotationWithoutInput: rocket.rotation,
            spawnPosition: rocket.position,
            spawnRotation: rocket.rotation,
        },

        entityType: EntityType.Rocket,
        rigidBody: body,
    })
    
    /*
        .set<EntityTypeComponent>(Components.EntityType, { type: EntityType.Rocket })
        .set<RigidBodyComponent>(Components.RigidBody, { body })
        .set(Components.Moving)
        .set<RocketComponent>(Components.Rocket, {
            collisionCount: 0,
            rotationWithoutInput: rocket.rotation,
            spawnPosition: rocket.position,
            spawnRotation: rocket.rotation,
        })
        .set(Components.CollisionEventListener)
    */
}

const rocketColliders = [[-0.894,-1.212,-0.882,-0.33,-0.87,-0.144,-0.834,0.096,-0.708,0.588,-0.456,1.152,-0.198,1.548,0,1.8,0.198,1.548,0.456,1.152,0.708,0.588,0.834,0.096,0.87,-0.144,0.882,-0.33,0.894,-1.212],[0.9,-1.8,0.24,-1.212,0.894,-1.212],[-0.9,-1.8,-0.894,-1.212,-0.24,-1.212]]

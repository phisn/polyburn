import { BiMap } from "mnemonist"
import {Entity } from "runtime-framework"

import { Components } from "../../Components"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"
import { CollisionEventComponent } from "../components/CollisionEventComponent"
import { RigidBodyComponent } from "../components/RigidBodyComponent"

export const newCollisionEventListenerSystem: RuntimeSystemFactory = (store, meta) => {
    const entityToBodyHandle = new BiMap<number, number>()

    store.getState().listenToEntities(
        (entity) => {
            const rigid = entity.getSafe<RigidBodyComponent>(Components.RigidBody)
            entityToBodyHandle.set(entity.id, rigid.body.handle)
        },
        (entityId) => {
            entityToBodyHandle.delete(entityId)
        },
        Components.RigidBody)

    return () => {
        meta.queue.drainCollisionEvents((h1, h2, started) => {
            const collider1 = meta.rapier.getCollider(h1)
            const collider2 = meta.rapier.getCollider(h2)

            const entity1 = entityFromHandle(collider1.parent()?.handle)
            const entity2 = entityFromHandle(collider2.parent()?.handle)

            if (entity1 === undefined || entity2 === undefined) {
                console.warn("Collision event for unknown entity")
                return
            }

            handleCollisionEvent(entity1, entity2, started, collider2.isSensor())
            handleCollisionEvent(entity2, entity1, started, collider1.isSensor())
        })
    }

    function entityFromHandle(handle?: number) {
        if (handle === undefined) {
            return undefined
        }

        const entityId = entityToBodyHandle.inverse.get(handle)

        if (entityId === undefined) {
            return undefined
        }

        return store.getState().entities.get(entityId)
    }

    function handleCollisionEvent(
        entity: Entity,
        other: Entity,
        started: boolean, 
        sensor: boolean
    ) {
        if (Components.CollisionEventListener in entity.components) {
            let collisionEvent = entity.get<CollisionEventComponent>(Components.CollisionEventListener)

            if (collisionEvent === undefined) {
                collisionEvent = { events: [] }
            }

            collisionEvent.events.push({
                other: other.id,
                started,
                sensor
            })
        }
    }
}
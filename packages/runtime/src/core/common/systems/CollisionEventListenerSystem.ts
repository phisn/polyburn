import { BiMap } from "mnemonist"

import {Entity } from "../../../../../runtime-framework/src"
import { RuntimeComponents } from "../../RuntimeComponents"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newCollisionEventListenerSystem: RuntimeSystemFactory = (store, meta) => {
    const entityToBodyHandle = new BiMap<number, number>()

    store.getState().listenToEntities(
        (entity) => entityToBodyHandle.set(entity.id, entity.components.rigidBody.handle),
        (entity) => entityToBodyHandle.delete(entity.id),
        "rigidBody")

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
        entity: Entity<RuntimeComponents>,
        other: Entity<RuntimeComponents>,
        started: boolean, 
        sensor: boolean
    ) {
        if (entity.has("collisionEventListener")) {
            if (entity.components.collisionEvent === undefined) {
                entity.components.collisionEvent = { events: [] }
            }

            entity.components.collisionEvent.events.push({
                other: other.id,
                started,
                sensor
            })
        }
    }
}
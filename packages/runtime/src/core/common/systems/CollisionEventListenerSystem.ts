import RAPIER from "@dimforge/rapier2d-compat"
import { BiMap } from "mnemonist"

import {Entity } from "../../../../../runtime-framework/src"
import { RuntimeComponents } from "../../RuntimeComponents"
import { RuntimeSystemFactory } from "../../RuntimeSystemFactory"

export const newCollisionEventListenerSystem: RuntimeSystemFactory = ({ store, rapier, queue }) => {
    const entityToBodyHandle = new BiMap<number, number>()

    store.listenTo(
        (entity) => entityToBodyHandle.set(entity.id, entity.components.rigidBody.handle),
        (entity) => entityToBodyHandle.delete(entity.id),
        "rigidBody")

    const entitiesWithCollision = store.newSet(
        "collision"
    )

    return () => {
        for (const entity of entitiesWithCollision) {
            if (entity.components.collision.events.length > 0) {
                entity.components.collision.events.length = 0
            }
        }

        queue.drainCollisionEvents((h1, h2, started) => {
            const collider1 = rapier.getCollider(h1)
            const collider2 = rapier.getCollider(h2)

            const entity1 = entityFromHandle(collider1.parent()?.handle)
            const entity2 = entityFromHandle(collider2.parent()?.handle)

            if (entity1 === undefined || entity2 === undefined) {
                console.warn("Collision event for unknown entity")
                return
            }

            handleCollisionEvent(entity1, entity2, started, collider2)
            handleCollisionEvent(entity2, entity1, started, collider1)
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

        return store.entities.get(entityId)
    }

    function handleCollisionEvent(
        entity: Entity<RuntimeComponents>,
        other: Entity<RuntimeComponents>,
        started: boolean, 
        collider: RAPIER.Collider
    ) {
        if (entity.has("collision")) {
            entity.components.collision.events.push({
                other,
                otherColliderHandle: collider.handle,
                started,
                sensor: collider.isSensor()
            })
        }
    }
}
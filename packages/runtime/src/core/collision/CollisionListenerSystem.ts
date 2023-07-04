import RAPIER from "@dimforge/rapier2d-compat"
import { BiMap } from "mnemonist"
import {Entity, MessageStore } from "runtime-framework"

import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeMessage } from "../RuntimeMessage"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newCollisionEventListenerSystem: RuntimeSystemFactory = ({ store, messageStore, rapier, queue }) => {
    const entityToBodyHandle = new BiMap<number, number>()

    store.listenTo(
        (entity) => entityToBodyHandle.set(entity.id, entity.components.rigidBody.handle),
        (entity) => entityToBodyHandle.delete(entity.id),
        "rigidBody")

    return () => {
        queue.drainCollisionEvents((h1, h2, started) => {
            const collider1 = rapier.getCollider(h1)
            const collider2 = rapier.getCollider(h2)

            const entity1 = entityFromHandle(collider1.parent()?.handle)
            const entity2 = entityFromHandle(collider2.parent()?.handle)

            if (entity1 === undefined || entity2 === undefined) {
                console.warn("Collision event for unknown entity")
                return
            }

            handleCollisionEvent(entity1, collider1, entity2, collider2, started, messageStore)
            handleCollisionEvent(entity2, collider2, entity1, collider1, started, messageStore)
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
        primary: Entity<RuntimeComponents>,
        primaryCollider: RAPIER.Collider,
        other: Entity<RuntimeComponents>,
        otherCollider: RAPIER.Collider,
        started: boolean, 
        messageStore: MessageStore<RuntimeMessage>
    ) {
        messageStore.publish("collision", {
            primary,
            primaryCollider,
            
            other,
            otherCollider,

            started,
            sensor: otherCollider.isSensor()
        })
    }
}
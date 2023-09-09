import RAPIER from "@dimforge/rapier2d"
import { BiMap } from "mnemonist"
import { Entity, MessageStore } from "runtime-framework"

import { RuntimeComponents } from "../RuntimeComponents"
import { RuntimeMessages } from "../RuntimeMessages"
import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newCollisionEventListenerSystem: RuntimeSystemFactory = ({
    store,
    messageStore,
    physics,
    queue,
}) => {
    const entityToBodyHandle = new BiMap<number, number>()

    store.listenTo(
        entity => entityToBodyHandle.set(entity.id, entity.components.rigidBody.handle),
        entity => entityToBodyHandle.delete(entity.id),
        "rigidBody",
    )

    return () => {
        queue.drainCollisionEvents((h1, h2, started) => {
            const collider1 = physics.getCollider(h1)
            const collider2 = physics.getCollider(h2)

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
        target: Entity<RuntimeComponents>,
        targetCollider: RAPIER.Collider,
        other: Entity<RuntimeComponents>,
        otherCollider: RAPIER.Collider,
        started: boolean,
        messageStore: MessageStore<RuntimeComponents, RuntimeMessages>,
    ) {
        messageStore.publishTarget("collision", {
            target,
            targetCollider,

            other,
            otherCollider,

            started,
            sensor: otherCollider.isSensor(),
        })
    }
}

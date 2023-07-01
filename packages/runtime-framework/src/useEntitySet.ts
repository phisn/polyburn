import { useSyncExternalStore } from "react"

import { EntityId } from "./Entity"
import { EntityStore } from "./EntityStore"
import { EntityWith } from "./NarrowComponents"

export function useEntitySet<Components extends object, T extends (keyof Components)[]>(
    store: EntityStore<Components>,
    ...components: [...T]
): EntityWith<Components, T[number]>[] {
    const newSet = new Map<EntityId, EntityWith<Components, typeof components[number]>>()

    for (const entity of store.findEntities(...components)) {
        newSet.set(entity.id, entity)
    }

    let memoizeValues = [...newSet.values()]
    
    return useSyncExternalStore(
        (callback) => store.listenToNewEntities(
            (entity, isNew) => {
                if (isNew) {
                    newSet.set(entity.id, entity)
                    memoizeValues = [...newSet.values()]
                }

                callback()
            },
            entity => {
                newSet.delete(entity.id) 

                memoizeValues = [...newSet.values()]

                callback()
            },
            ...components),
        () => memoizeValues)
}

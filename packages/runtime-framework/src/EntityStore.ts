
import { Entity, EntityId } from "./Entity"
import { EntitySet } from "./EntitySet"
import { EntityWith, NarrowComponents } from "./NarrowComponents"

export interface EntityStoreState<Components extends object> {
    get entities(): Map<EntityId, Entity<Components>>
    get world(): Entity<Components>

    newEntity<L extends keyof Components = never>(base?: NarrowComponents<Components, L>): Entity<NarrowComponents<Components, L>>

    removeEntity(id: EntityId): void

    findEntities<T extends (keyof Components)[]>(...components: [...T]): Entity<NarrowComponents<Components, typeof components[number]>>[]
    newEntitySet<T extends (keyof Components)[]>(...components: [...T]): EntitySet<NarrowComponents<Components, typeof components[number]>>

    listenToNewEntities<T extends (keyof Components)[]>(
        set?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>, isNew: boolean) => void,
        del?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>) => void,
        ...components: [...T]
    ): () => void

    listenToEntities<T extends (keyof Components)[]>(
        set?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>, isNew: boolean) => void,
        del?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>) => void,
        ...components: [...T]
    ): () => void
}

export const createEntityStore = <Components extends object> () => {
    let nextEntityId = 0

    const entities = new Map<EntityId, Entity<Components>>()

    const newEntityListeners: ((entity: Entity<Components>) => void)[] = []
    const delEntityListeners: ((entity: Entity<Components>) => void)[] = []

    const componentSetListeners = new Map<keyof Components, ((entity: Entity<Components>, isNew: boolean) => void)[]>()
    const componentDelListeners = new Map<keyof Components, ((entity: Entity<Components>) => void)[]>()

    const world = newEntity() as Entity<Components>

    interface EntitySetCached {
        set: EntitySet<Record<string, unknown>>
        referenceCounter: number
    }

    const entitySetCache = new Map<string, EntitySetCached>()

    return {
        entities,
        get world() { return world },

        newEntity,

        removeEntity(id: EntityId) {
            const entity = entities.get(id)

            if (entity === undefined) {
                return
            }

            for (const key of Object.keys(entity.components)) {
                for (const callback of componentDelListeners.get(key as keyof Components) ?? []) {
                    callback(entity)
                }
            }

            for (const callback of delEntityListeners) {
                callback(entity)
            }

            entities.delete(id)
        },
        findEntities,
        newEntitySet<T extends (keyof Components)[]>(...components: [...T]) {
            const key = components.sort().join(",")
            const setCached = entitySetCache.get(key)

            if (setCached) {
                setCached.referenceCounter++
                return setCached.set as EntitySet<NarrowComponents<Components, typeof components[number]>>
            }

            const newSet = new Map<EntityId, EntityWith<Components, typeof components[number]>>()

            const free = this.listenToEntities(
                (entity, isNew) => {
                    if (isNew) {
                        newSet.set(entity.id, entity)
                    }
                },
                entity => newSet.delete(entity.id),
                ...components)

            const entitySet: EntitySet<NarrowComponents<Components, typeof components[number]>> = {
                [Symbol.iterator]() {
                    return newSet.values()
                },
                free() {
                    newSetCached.referenceCounter--

                    if (newSetCached.referenceCounter === 0) {
                        entitySetCache.delete(key)
                        free()
                    }
                },
            }

            const newSetCached = {
                set: entitySet,
                referenceCounter: 1
            }

            entitySetCache.set(key, newSetCached)

            return entitySet
        },
        listenToNewEntities<T extends (keyof Components)[]>(
            set?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>, isNew: boolean) => void,
            del?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>) => void,
            ...components: [...T]
        ): () => void {
            if (set === undefined && del === undefined) {
                throw new Error("add and remove cannot both be undefined")
            }

            if (components.length === 0) {
                return listenToAllEntities(
                    set === undefined ? undefined : (entity) => set(entity as Entity<NarrowComponents<Components, typeof components[number]>>, true),
                    del === undefined ? undefined : (entity) => del(entity as Entity<NarrowComponents<Components, typeof components[number]>>)
                )
            }

            let setListener: (entity: Entity<Components>, isNew: boolean) => void
            let delListener: (entity: Entity<Components>) => void

            if (set) {
                setListener = (entity: Entity<Components>, isNew: boolean) => {
                    if (entity.has(...components)) {
                        set(entity, isNew)
                    }
                }

                components.forEach(component => {
                    const listeners = componentSetListeners.get(component) ?? []
                    listeners.push(setListener)
                    componentSetListeners.set(component, listeners)
                })
            }

            if (del) {
                delListener = (entity: Entity<Components>) => {
                    if (entity.has(...components)) {
                        del(entity)
                    }
                }

                components.forEach(component => {
                    const listeners = componentDelListeners.get(component) ?? []
                    listeners.push(delListener)
                    componentDelListeners.set(component, listeners)
                })
            }

            return () => {
                if (setListener) {
                    components.forEach(component => {
                        const listeners = componentSetListeners.get(component) ?? []
                        listeners.splice(listeners.indexOf(setListener), 1)
                        componentSetListeners.set(component, listeners)
                    })
                }

                if (delListener) {
                    components.forEach(component => {
                        const listeners = componentDelListeners.get(component) ?? []
                        listeners.splice(listeners.indexOf(delListener), 1)
                        componentDelListeners.set(component, listeners)
                    })
                }
            }
        },
        listenToEntities<T extends (keyof Components)[]>(
            set?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>, isNew: boolean) => void,
            del?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>) => void,
            ...components: [...T]
        ) {
            const free = this.listenToNewEntities(set, del, ...components)

            if (set) {
                for (const [, entity] of entities) {
                    if (entity.has(...components)) {
                        set(entity, true)
                    }
                }
            }

            return free
        }
    }

    function listenToAllEntities(
        set?: (entity: Entity<Components>) => void, 
        del?: (entity: Entity<Components>) => void
    ) {
        if (set) {
            newEntityListeners.push(set)

            for (const [, entity] of entities) {
                set(entity)
            }
        }

        if (del) {
            delEntityListeners.push(del)
        }

        return () => {
            if (set) {
                newEntityListeners.splice(newEntityListeners.indexOf(set), 1)
            }

            if (del) {
                delEntityListeners.splice(delEntityListeners.indexOf(del), 1)
            }
        }
    }

    function findEntities<T extends (keyof Components)[]>(...components: [...T]): Entity<NarrowComponents<Components, typeof components[number]>>[] {
        const found = []

        for (const [, entity] of entities) {
            if (entity.has(...components)) {
                found.push(entity)
            }
        }

        return found
    }

    function newEntity<L extends keyof Components = never>(base?: NarrowComponents<Components, L>): Entity<NarrowComponents<Components, L>> {
        const entityId = nextEntityId++

        // assuming in type assertion that L is never if base is undefined
        const entityComponents = new Proxy(base ?? { } as NarrowComponents<Components, L>, {
            set(target, prop, value) {
                const isNew = prop in target === false

                target[prop as L] = value

                for (const callback of componentSetListeners.get(prop as keyof Components) ?? []) {
                    callback(entity, isNew)
                }

                return true
            },
            deleteProperty(target, prop) {
                if (prop in target) {
                    for (const callback of componentDelListeners.get(prop as keyof Components) ?? []) {
                        callback(entity)
                    }

                    return delete target[prop as L]
                }

                return false
            },
        })

        const entity: Entity<NarrowComponents<Components, L>> = {
            get components() { return entityComponents },
            get id() { return entityId },

            has<T extends (keyof Components)[]>(...components: [...T]) {
                return components.every(component => component in entityComponents)
            }
        }
        
        entities.set(entityId, entity)

        for (const key of Object.keys(entity.components)) {
            for (const callback of componentSetListeners.get(key as keyof Components) ?? []) {
                callback(entity, true)
            }
        }

        for (const callback of newEntityListeners) {
            callback(entity)
        }

        return entity
    }
}

export type EntityStore<Components extends object> = EntityStoreState<Components>

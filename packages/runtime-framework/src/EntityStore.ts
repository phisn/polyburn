
import { Entity, EntityId } from "./Entity"
import { EntitySet } from "./EntitySet"
import { EntityWith, NarrowProperties } from "./NarrowProperties"

export interface EntityStoreState<Components extends object> {
    get entities(): Map<EntityId, Entity<Components>>
    get world(): Entity<Components>

    create<L extends keyof Components = never>(base?: NarrowProperties<Components, L>): Entity<NarrowProperties<Components, L>>
    remove(id: EntityId): void

    find<T extends (keyof Components)[]>(...components: [...T]): Entity<NarrowProperties<Components, T[number]>>[]
    newSet<T extends (keyof Components)[]>(...components: [...T]): EntitySet<NarrowProperties<Components, T[number]>>

    listenToNew<T extends (keyof Components)[]>(
        set?: (entity: Entity<NarrowProperties<Components, T[number]>>, isNew: boolean) => void,
        del?: (entity: Entity<NarrowProperties<Components, T[number]>>) => void,
        ...components: [...T]
    ): () => void

    listenTo<T extends (keyof Components)[]>(
        set?: (entity: Entity<NarrowProperties<Components, T[number]>>, isNew: boolean) => void,
        del?: (entity: Entity<NarrowProperties<Components, T[number]>>) => void,
        ...components: [...T]
    ): () => void
}

export const createEntityStore = <Components extends object>(): EntityStoreState<Components> => {
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

        create: newEntity,

        remove(id: EntityId) {
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
        find: findEntities,
        newSet<T extends (keyof Components)[]>(...components: [...T]) {
            const key = components.sort().join(",")
            const setCached = entitySetCache.get(key)

            if (setCached) {
                setCached.referenceCounter++
                return setCached.set as EntitySet<NarrowProperties<Components, T[number]>>
            }

            const newSet = new Map<EntityId, EntityWith<Components, T[number]>>()

            const free = this.listenTo(
                (entity, isNew) => {
                    if (isNew) {
                        newSet.set(entity.id, entity)
                    }
                },
                entity => newSet.delete(entity.id),
                ...components)

            const entitySet: EntitySet<NarrowProperties<Components, T[number]>> = {
                [Symbol.iterator]() {
                    return newSet.values()
                },
                /*
                free() {
                    newSetCached.referenceCounter--

                    if (newSetCached.referenceCounter === 0) {
                        entitySetCache.delete(key)
                        free()
                    }
                },
                */
            }

            const newSetCached = {
                set: entitySet,
                referenceCounter: 1
            }

            entitySetCache.set(key, newSetCached)

            return entitySet
        },
        listenToNew<T extends (keyof Components)[]>(
            set?: (entity: Entity<NarrowProperties<Components, T[number]>>, isNew: boolean) => void,
            del?: (entity: Entity<NarrowProperties<Components, T[number]>>) => void,
            ...components: [...T]
        ): () => void {
            if (set === undefined && del === undefined) {
                throw new Error("add and remove cannot both be undefined")
            }

            if (components.length === 0) {
                return listenToAllEntities(
                    set === undefined ? undefined : (entity) => set(entity as Entity<NarrowProperties<Components, T[number]>>, true),
                    del === undefined ? undefined : (entity) => del(entity as Entity<NarrowProperties<Components, T[number]>>)
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
        listenTo<T extends (keyof Components)[]>(
            set?: (entity: Entity<NarrowProperties<Components, T[number]>>, isNew: boolean) => void,
            del?: (entity: Entity<NarrowProperties<Components, T[number]>>) => void,
            ...components: [...T]
        ) {
            const free = this.listenToNew(set, del, ...components)

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

    function findEntities<T extends (keyof Components)[]>(...components: [...T]): Entity<NarrowProperties<Components, T[number]>>[] {
        const found = []

        for (const [, entity] of entities) {
            if (entity.has(...components)) {
                found.push(entity)
            }
        }

        return found
    }

    function newEntity<L extends keyof Components = never>(base?: NarrowProperties<Components, L>): Entity<NarrowProperties<Components, L>> {
        const entityId = nextEntityId++

        // assuming in type assertion that L is never if base is undefined
        const entityComponents = new Proxy(base ?? { } as NarrowProperties<Components, L>, {
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

        const entity: Entity<NarrowProperties<Components, L>> = {
            get components() { return entityComponents },
            get id() { return entityId },

            has<T extends (keyof Components)[]>(...components: [...T]) {
                return components.every(component => component in entityComponents)
            },
            extend() {
                return true
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

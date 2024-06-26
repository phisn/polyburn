import { Entity, EntityId } from "./entity"
import { EntitySet } from "./entity-set"
import { EntityTracker } from "./entity-tracker"
import { EntityWith, NarrowProperties } from "./narrow-properties"

export interface EntityStoreState<Components extends object> {
    get entities(): Map<EntityId, Entity<Components>>
    get world(): Entity<Components>

    create<L extends keyof Components = never>(
        base?: NarrowProperties<Components, L>,
        entityId?: EntityId,
    ): Entity<NarrowProperties<Components, L>>
    remove(id: EntityId): void

    find<T extends (keyof Components)[]>(
        ...components: [...T]
    ): Entity<NarrowProperties<Components, T[number]>>[]
    newSet<T extends (keyof Components)[]>(
        ...components: [...T]
    ): EntitySet<NarrowProperties<Components, T[number]>>
    newTracker(): EntityTracker<Components>

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

    toString(): string
}

export const createEntityStore = <Components extends object>(): EntityStoreState<Components> => {
    let nextEntityId = 0

    const entities = new Map<EntityId, Entity<Components>>()

    const newEntityListeners: ((entity: Entity<Components>) => void)[] = []
    const delEntityListeners: ((entity: Entity<Components>) => void)[] = []

    const componentSetListeners = new Map<
        keyof Components,
        ((entity: Entity<Components>, isNew: boolean) => void)[]
    >()
    const componentDelListeners = new Map<
        keyof Components,
        ((entity: Entity<Components>) => void)[]
    >()

    const world = newEntity() as Entity<Components>

    interface EntitySetCached {
        set: EntitySet<Record<string, unknown>>
        referenceCounter: number
    }

    const entitySetCache = new Map<string, EntitySetCached>()

    return {
        entities,
        get world() {
            return world
        },

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
                ...components,
            )

            const entitySet: EntitySet<NarrowProperties<Components, T[number]>> = {
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
                size() {
                    return newSet.size
                },

                map(callback) {
                    return [...newSet.values()].map(callback)
                },

                add<T extends keyof Components>(componentName: T, component: Components[T]): void {
                    for (const entity of entities.values()) {
                        entity.components[componentName] = component
                    }
                },
                remove<T extends keyof Components>(componentName: T): void {
                    for (const entity of entities.values()) {
                        delete entity.components[componentName]
                    }
                },

                toString() {
                    return `EntitySet(${[...components].join(", ")})`
                },
            }

            const newSetCached = {
                set: entitySet,
                referenceCounter: 1,
            }

            entitySetCache.set(key, newSetCached)

            return entitySet
        },
        newTracker(): EntityTracker<Components> {
            const entities = new Map<EntityId, Entity<Components>>()
            const listeners = new Set<() => void>()

            const onDelEntity = (entity: Entity<Components>) => {
                entities.delete(entity.id)
            }

            delEntityListeners.push(onDelEntity)

            return {
                [Symbol.iterator]() {
                    return entities.values()
                },
                free(): void {
                    delEntityListeners.splice(delEntityListeners.indexOf(onDelEntity), 1)
                },

                onChange(callback) {
                    listeners.add(callback)
                    return () => void listeners.delete(callback)
                },

                add(...entitiesArg: Entity<Components>[]): void {
                    for (const entity of entitiesArg) {
                        entities.set(entity.id, entity)
                    }

                    for (const callback of listeners) {
                        callback()
                    }
                },
                set(...entitiesArg: Entity<Components>[]): void {
                    entities.clear()
                    this.add(...entitiesArg)
                },

                delete(...entitiesArg: EntityId[]): void {
                    for (const id of entitiesArg) {
                        entities.delete(id)
                    }

                    for (const callback of listeners) {
                        callback()
                    }
                },

                clear(): void {
                    entities.clear()

                    for (const callback of listeners) {
                        callback()
                    }
                },

                components(): (keyof Components)[] {
                    const entityIterator = entities.values()
                    const first = entityIterator.next()

                    const collected = new Map<string, number>(
                        first.done ? [] : Object.keys(first.value.components).map(key => [key, 1]),
                    )

                    for (const entity of entityIterator) {
                        for (const key of Object.keys(entity.components)) {
                            const elementInCollected = collected.get(key)

                            if (elementInCollected === undefined) {
                                continue
                            }

                            collected.set(key, elementInCollected + 1)
                        }
                    }

                    return [...collected.entries()]
                        .filter(([, count]) => count === entities.size)
                        .map(([key]) => key as keyof Components)
                },
            }
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
                    set === undefined
                        ? undefined
                        : entity =>
                              set(entity as Entity<NarrowProperties<Components, T[number]>>, true),
                    del === undefined
                        ? undefined
                        : entity => del(entity as Entity<NarrowProperties<Components, T[number]>>),
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

                for (const component of components) {
                    const listeners = componentSetListeners.get(component) ?? []
                    listeners.push(setListener)
                    componentSetListeners.set(component, listeners)
                }
            }

            if (del) {
                delListener = (entity: Entity<Components>) => {
                    if (entity.has(...components)) {
                        del(entity)
                    }
                }

                for (const component of components) {
                    const listeners = componentDelListeners.get(component) ?? []
                    listeners.push(delListener)
                    componentDelListeners.set(component, listeners)
                }
            }

            return () => {
                if (setListener) {
                    for (const component of components) {
                        const listeners = componentSetListeners.get(component) ?? []
                        listeners.splice(listeners.indexOf(setListener), 1)
                        componentSetListeners.set(component, listeners)
                    }
                }

                if (delListener) {
                    for (const component of components) {
                        const listeners = componentDelListeners.get(component) ?? []
                        listeners.splice(listeners.indexOf(delListener), 1)
                        componentDelListeners.set(component, listeners)
                    }
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
        },

        toString() {
            const entitiesStr = [...entities].map(([, entity]) => entity.toString()).join(", ")
            return `EntityStore(${entitiesStr})`
        },
    }

    function listenToAllEntities(
        set?: (entity: Entity<Components>) => void,
        del?: (entity: Entity<Components>) => void,
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

    function findEntities<T extends (keyof Components)[]>(
        ...components: [...T]
    ): Entity<NarrowProperties<Components, T[number]>>[] {
        if (components.length === 0) {
            return [...entities.values()] as Entity<NarrowProperties<Components, T[number]>>[]
        }

        const found = []

        for (const [, entity] of entities) {
            if (entity.has(...components)) {
                found.push(entity)
            }
        }

        return found
    }

    function newEntity<L extends keyof Components = never>(
        base?: NarrowProperties<Components, L>,
        suggestEntityId?: EntityId,
    ): Entity<NarrowProperties<Components, L>> {
        const entityId = suggestEntityId ?? nextEntityId++

        // assuming in type assertion that L is never if base is undefined
        const entityComponents = new Proxy(base ?? ({} as NarrowProperties<Components, L>), {
            set(target, property, value) {
                const isNew = property in target === false

                target[property as L] = value

                for (const callback of componentSetListeners.get(property as keyof Components) ??
                    []) {
                    callback(entity, isNew)
                }

                return true
            },
            deleteProperty(target, property) {
                if (property in target) {
                    for (const callback of componentDelListeners.get(
                        property as keyof Components,
                    ) ?? []) {
                        callback(entity)
                    }

                    return delete target[property as L]
                }

                return false
            },
        })

        const entity: Entity<NarrowProperties<Components, L>> = {
            get components() {
                return entityComponents
            },
            get id() {
                return entityId
            },

            has<T extends (keyof Components)[]>(...components: [...T]) {
                return components.every(component => component in entityComponents)
            },
            extend() {
                return true
            },
            with<K extends Partial<NarrowProperties<Components, L>>>(components: K) {
                for (const key of Object.keys(components)) {
                    entityComponents[key as L] = components[key as L] as any
                }

                return entity as Entity<NarrowProperties<Components, L> & K>
            },

            toString() {
                return Object.keys(entityComponents).length > 0
                    ? `Entity(${entityId}: ${Object.keys(entityComponents).join(", ")})`
                    : `Entity(${entityId})`
            },
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

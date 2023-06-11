import { createStore , StoreApi } from "zustand"

import { Entity } from "./Entity"
import { EntitySet } from "./EntitySet"
import { NarrowComponents } from "./NarrowComponents"

export interface EntityStoreState<Components extends object> {
    get entities(): Map<number, Entity<Components>>
    get world(): Entity<Components>

    newEntity<L extends keyof Components>(base: NarrowComponents<Components, L>): Entity<NarrowComponents<Components, L>>

    removeEntity(id: number): void

    findEntities<T extends (keyof Components)[]>(...components: [...T]): Entity<NarrowComponents<Components, typeof components[number]>>[]
    newEntitySet<T extends (keyof Components)[]>(...components: [...T]): EntitySet<NarrowComponents<Components, typeof components[number]>>

    listenToEntities<T extends (keyof Components)[]>(
        set?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>, isNew: boolean) => void,
        del?: (entity: Entity<NarrowComponents<Components, typeof components[number]>>) => void,
        ...components: [...T]
    ): () => void
}

export const createEntityStore = <Components extends object> () => createStore<EntityStoreState<Components>>((set, get) => {
    let nextEntityId = 0

    const newEntityListeners: ((entity: Entity<Components>) => void)[] = []
    const delEntityListeners: ((entity: Entity<Components>) => void)[] = []

    const componentSetListeners = new Map<keyof Components, ((entity: Entity<Components>, isNew: boolean) => void)[]>()
    const componentDelListeners = new Map<keyof Components, ((entity: Entity<Components>) => void)[]>()

    const entities = new Map<number, Entity<Components>>()
    const world = newEntity({} as Components) as Entity<Components>

    return {
        get entities() { return entities },
        get world() { return world },

        newEntity,

        removeEntity(id: number) {
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
            const entitiesInSet = new Map<number, Entity<NarrowComponents<Components, typeof components[number]>>>()

            const free = get().listenToEntities(
                (entity, isNew) => isNew && entitiesInSet.set(entity.id, entity),
                entity => entitiesInSet.delete(entity.id),
                ...components)

            const entitySet: EntitySet<NarrowComponents<Components, typeof components[number]>> = {
                [Symbol.iterator]() {
                    return entitiesInSet.values()
                },
                free,
            }

            for (const entity of findEntities(...components)) {
                entitiesInSet.set(entity.id, entity)
            }

            return entitySet
        },
        listenToEntities(set, del, ...components) {
            if (set === undefined && del === undefined) {
                throw new Error("add and remove cannot both be undefined")
            }

            if (components.length === 0) {
                const commonSet = set as ((entity: Entity<Components>) => void) | undefined
                const commonDel = del as ((entity: Entity<Components>) => void) | undefined

                if (commonSet) {
                    newEntityListeners.push(commonSet)

                    for (const [, entity] of entities) {
                        commonSet(entity)
                    }
                }

                if (commonDel) {
                    delEntityListeners.push(commonDel)
                }

                return () => {
                    if (commonSet) {
                        newEntityListeners.splice(newEntityListeners.indexOf(commonSet), 1)
                    }

                    if (commonDel) {
                        delEntityListeners.splice(delEntityListeners.indexOf(commonDel), 1)
                    }
                }
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

                for (const [, entity] of entities) {
                    if (entity.has(...components)) {
                        set(entity, true)
                    }
                }
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

    function newEntity<L extends keyof Components>(base: NarrowComponents<Components, L>): Entity<NarrowComponents<Components, L>> {
        const entityId = nextEntityId++

        const entityComponents = new Proxy(base ?? { } as Components, {
            set(target, prop, value) {
                const isNew = prop in target
                target[prop as L] = value

                for (const callback of componentSetListeners.get(prop as keyof Components) ?? []) {
                    callback(entity as Entity<Components>, isNew)
                }

                return true
            },
            deleteProperty(target, prop) {
                if (prop in target) {
                    for (const callback of componentDelListeners.get(prop as keyof Components) ?? []) {
                        callback(entity as Entity<Components>)
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

        for (const key of Object.keys(entity.components)) {
            for (const callback of componentSetListeners.get(key as keyof Components) ?? []) {
                callback(entity as Entity<Components>, true)
            }
        }

        for (const callback of newEntityListeners) {
            callback(entity as Entity<Components>)
        }

        return entity
    }
})

export type EntityStore<Components extends object> = StoreApi<EntityStoreState<Components>>

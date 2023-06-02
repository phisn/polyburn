import { createStore, StoreApi } from "zustand"

import { Entity } from "./Entity"
import { EntitySet } from "./EntitySet"

export interface EntityStoreState {
    entities: Map<number, Entity>
    world: Entity,

    newEntitySet(...components: string[]): EntitySet

    newEntity(): Entity
    removeEntity(entityId: number): void
    
    // remove gets called even if the entity was never added
    listenToEntities(
        add: (entity: Entity) => void,
        remove: (entityId: number) => void,
        ...components: string[]
    ): () => void
}

export type EntityStore = StoreApi<EntityStoreState>

export const createEntityStore = () => createStore<EntityStoreState>((set, get) => {
    let entityIdCounter = 0
    
    interface RuntimeEntityListener {
        add(entityId: number): void
        remove(entityId: number): void
    }

    const componentChangeListeners = new Map<string, RuntimeEntityListener[]>()
    const entityListeners: RuntimeEntityListener[] = []

    const store: EntityStoreState = {
        entities: new Map(),
        world: newEntity(),

        newEntitySet(...components) {
            const entitiesInSet = new Map<number, Entity>()

            const free = get().listenToEntities(
                entity => entitiesInSet.set(entity.id, entity),
                entityId => entitiesInSet.delete(entityId),
                ...components)

            const entitySet: EntitySet = {
                [Symbol.iterator]() { return entitiesInSet.values() },
                free
            }

            get().entities.forEach((entity, entityId) => {
                if (components.every(component => component in entity.components)) {
                    entitiesInSet.set(entityId, entity)
                }
            })

            return entitySet
        },

        newEntity,

        listenToEntities(add, remove, ...components) {
            // special case: listen to all entities
            if (components.length == 0) {
                const listener = { 
                    add: (entityId: number) => add(get().entities.get(entityId)!),
                    remove
                }

                entityListeners.push(listener)

                return () => {
                    entityListeners.splice(entityListeners.indexOf(listener), 1)
                }
            }

            const internalListener: RuntimeEntityListener = {
                add(entityId: number) {
                    const entity = get().entities.get(entityId)

                    if (entity === undefined) {
                        console.error(`Entity ${entityId} does not exist`)
                        return
                    }

                    if (components.every(component => component in entity.components)) {
                        add(entity)
                    }
                },
                remove
            }

            components.forEach(component => {
                getComponentChangeListeners(component).push(internalListener)
            })

            return () => {
                components.forEach(component => {
                    removeComponentChangeListeners(component, internalListener)
                })
            }
        },

        removeEntity(entityId) {
            console.assert(get().entities.has(entityId), `Entity ${entityId} does not exist`)

            for (const component in get().entities.get(entityId)?.components) {
                getComponentChangeListeners(component).forEach(listener => listener.remove(entityId))
            }

            // calling remove before the entity is removed from the store
            entityListeners.forEach(listener => listener.remove(entityId))

            set(state => {
                const entities = new Map(state.entities)
                entities.delete(entityId)
                return { ...state, entities }
            })
        }
    }

    function getComponentChangeListeners(component: string) {
        let listeners = componentChangeListeners.get(component)

        if (listeners === undefined) {
            listeners = []
            componentChangeListeners.set(component, listeners)
        }

        return listeners
    }

    function removeComponentChangeListeners(component: string, listener: RuntimeEntityListener) {
        const listeners = componentChangeListeners.get(component) ?? []
        listeners.splice(listeners.indexOf(listener), 1)
    }

    function newEntity() {
        const entityId = entityIdCounter++
        const components: { [key: string]: unknown } = {}

        const entity: Entity = {
            get components() {
                return components
            },
            get id() {
                return entityId
            },
            get<T>(component: string): T {
                return components[component] as T
            },
            getSafe<T>(component: string): T {
                console.assert(component in components, `Component ${component} does not exist`)
                return components[component] as T
            },
            getOrDefault<T>(component: string, def: T): T {
                if (component in components) {
                    return components[component] as T
                }

                return def
            },
            set<T>(component: string, value: T): Entity {
                console.assert(!(component in components), `Component ${component} already exists`)

                components[component] = value
                getComponentChangeListeners(component).forEach(listener => listener.add(entityId))
                return this
            },
            remove(component: string): Entity {
                console.assert(component in components, `Component ${component} does not exist`)

                delete components[component]
                getComponentChangeListeners(component).forEach(listener => listener.remove(entityId))
                return this
            }
        }

        set(state => ({
            ...state,
            entities: new Map(state.entities).set(entityId, entity)
        }))

        // calling add after the entity is added to the store
        entityListeners.forEach(listener => listener.add(entityId))

        return entity
    }

    return store
})

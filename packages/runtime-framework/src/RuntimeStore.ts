import { createStore, StoreApi } from "zustand"

import { RuntimeEntity } from "./RuntimeEntity"
import { RuntimeEntitySet } from "./RuntimeEntitySet"
import { RuntimeSystem } from "./RuntimeSystem"

export interface RuntimeState<T = void> {
    entities: Map<number, RuntimeEntity>
    systems: RuntimeSystem<T>[]
    
    newEntitySet(...components: string[]): RuntimeEntitySet

    newEntity(): RuntimeEntity
    removeEntity(entityId: number): void

    addSystem(...system: RuntimeSystem<T>[]): void

    step(context: T): void
    
    // remove gets called even if the entity was never added
    listenToEntities(
        add: (entity: RuntimeEntity) => void,
        remove: (entityId: number) => void,
        ...components: string[]
    ): () => void
}

export type RuntimeStore<T = void> = StoreApi<RuntimeState<T>>

export const createRuntimeStore = <T = void> () => createStore<RuntimeState<T>>((set, get) => {
    let entityIdCounter = 0
    
    interface RuntimeEntityListener {
        add(entityId: number): void
        remove(entityId: number): void
    }

    const componentChangeListeners = new Map<string, RuntimeEntityListener[]>()
    const entityListeners: RuntimeEntityListener[] = []

    const store: RuntimeState<T> = {
        entities: new Map(),
        systems: [],

        newEntitySet(...components) {
            const entitiesInSet = new Map<number, RuntimeEntity>()

            const free = get().listenToEntities(
                entity => entitiesInSet.set(entity.id, entity),
                entityId => entitiesInSet.delete(entityId),
                ...components)

            const entitySet: RuntimeEntitySet = {
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

        newEntity() {
            const entityId = entityIdCounter++
            const components: { [key: string]: unknown } = {}

            const entity: RuntimeEntity = {
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
                set<T>(component: string, value: T): RuntimeEntity {
                    console.assert(!(component in components), `Component ${component} already exists`)

                    components[component] = value
                    getComponentChangeListeners(component).forEach(listener => listener.add(entityId))
                    return this
                },
                remove(component: string): RuntimeEntity {
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
        },
        addSystem(...systems) {
            set(state => ({
                ...state,
                systems: [...state.systems, ...systems]
            }))
        },
        step(context) {
            get().systems.forEach(system => system(context))
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

    return store
})

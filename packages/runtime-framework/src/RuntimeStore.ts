import { createStore } from "zustand"

import { RuntimeEntity } from "./RuntimeEntity"
import { RuntimeEntitySet } from "./RuntimeEntitySet"
import { RuntimeSystem } from "./RuntimeSystem"

interface RuntimeState {
    entities: Map<number, RuntimeEntity>
    systems: RuntimeSystem[]
}

interface RuntimeStore extends RuntimeState {
    newEntitySet(...components: string[]): RuntimeEntitySet

    newEntity(): RuntimeEntity
    removeEntity(entityId: number): void

    addSystem(...system: RuntimeSystem[]): void
}

export const createRuntimeStore = () => createStore<RuntimeStore>((set, get) => {
    let entityIdCounter = 0

    interface Listener {
        add(entityId: number): void
        remove(entityId: number): void
    }

    const componentChangeListeners = new Map<string, Listener[]>()

    const store: RuntimeStore = {
        entities: new Map(),
        systems: [],

        newEntitySet(...components) {
            const entitiesInSet = new Map<number, RuntimeEntity>()
            
            const entitySet: RuntimeEntitySet = {
                [Symbol.iterator]() { return entitiesInSet.values() },
                free() {
                    components.forEach(component => {
                        removeComponentChangeListeners(component, listener)
                    })
                }
            }

            const listener: Listener = {
                add(entityId: number) {
                    const entity = get().entities.get(entityId)

                    if (entity === undefined) {
                        console.error(`Entity ${entityId} does not exist`)
                        return
                    }

                    if (shouldEntityBeInSet(entity)) {
                        entitiesInSet.set(entityId, entity!)
                    }
                },
                remove(entityId: number) {
                    entitiesInSet.delete(entityId)
                }
            }
            
            components.forEach(component => {
                getComponentChangeListeners(component).push(listener)
            })

            get().entities.forEach((entity, entityId) => {
                if (shouldEntityBeInSet(entity)) {
                    entitiesInSet.set(entityId, entity)
                }
            })
            
            function shouldEntityBeInSet(entity: RuntimeEntity) {
                return components.every(component => component in entity.components)
            }

            return entitySet
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
                getComponent<T>(component: string): T {
                    return components[component] as T
                },
                addComponent<T>(component: string, value: T): RuntimeEntity {
                    console.assert(!(component in components), `Component ${component} already exists`)

                    components[component] = value
                    getComponentChangeListeners(component).forEach(listener => listener.add(entityId))
                    return this
                },
                removeComponent(component: string): RuntimeEntity {
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

            return entity
        },
        removeEntity(entityId) {
            console.assert(get().entities.has(entityId), `Entity ${entityId} does not exist`)

            for (const component in get().entities.get(entityId)?.components) {
                getComponentChangeListeners(component).forEach(listener => listener.remove(entityId))
            }

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

    function removeComponentChangeListeners(component: string, listener: Listener) {
        const listeners = componentChangeListeners.get(component) ?? []
        listeners.splice(listeners.indexOf(listener), 1)
    }

    return store
})

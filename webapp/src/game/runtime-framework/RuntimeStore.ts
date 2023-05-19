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

export const createRuntimeStore = createStore<RuntimeStore>((set, get) => {
    let entityIdCounter = 0

    interface Listener {
        add(entityId: number): void
        remove(entityId: number): void
    }

    const componentChangeListeners = new Map<string, Listener[]>()

    const rs: RuntimeStore = {
        entities: new Map(),
        systems: [],

        newEntitySet(...components) {
            const entitiesInSet = new Map<number, RuntimeEntity>()

            const listener: Listener = {
                add(entityId: number) {
                    const entity = get().entities.get(entityId)

                    if (entity === undefined) {
                        console.error(`Entity ${entityId} does not exist`)
                        return
                    }

                    if (components.every(component => component in entity.components)) {
                        entitiesInSet.set(entityId, entity!)
                    }
                },
                remove(entityId: number) {
                    entitiesInSet.delete(entityId)
                }
            }
            
            for (const component of components) {
                const listeners = componentChangeListeners.get(component) ?? []

            }

            for (const entity of get().entities.values()) {
                void 0
            }

            const entitySet: RuntimeEntitySet = {
                [Symbol.iterator]() { return entitiesInSet.values() },
                free() {
                    
                }
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
                getComponent<T>(component: string): T {
                    return components[component] as T
                },
                addComponent<T>(component: string, value: T): RuntimeEntity {
                    console.assert(!(component in components), `Component ${component} already exists`)

                    components[component] = value
                    componentChangeListeners.get(component)?.forEach(listener => listener.add(entityId))
                    return this
                },
                removeComponent(component: string): RuntimeEntity {
                    console.assert(component in components, `Component ${component} does not exist`)

                    delete components[component]
                    componentChangeListeners.get(component)?.forEach(listener => listener.remove(entityId))
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
                componentChangeListeners.get(component)?.forEach(listener => listener.remove(entityId))
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

    return rs
})

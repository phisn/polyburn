import { produce } from "immer"
import { useEffect, useRef } from "react"
import { StateCreator } from "zustand"
import { useEditorStore } from "./store" // Assuming './store' exports the zustand store created with this slice
import { EntityComponents } from "./world" // Assuming this path is correct

type ListenerCallback<T = any> = (data: T) => void
type ComponentListeners = Set<ListenerCallback>

export interface EventSlice {
    listeners: Map<string, ComponentListeners>

    listen<T extends keyof EntityComponents>(
        id: string,
        componentName: T,
        f: (x: EntityComponents[T]) => void,
    ): () => void

    invoke: <T extends keyof EntityComponents>(
        id: string,
        componentName: T,
        component: EntityComponents[T],
    ) => void
}

export const createEventSlice: StateCreator<EventSlice> = (set, get) => ({
    listeners: new Map(),

    invoke: (id, componentName, component) => {
        const componentListeners = get().listeners.get(`${id},${componentName}`)

        if (componentListeners) {
            new Set(componentListeners).forEach(callback => callback(component))
        }
    },
    listen: (id, componentName, f) => {
        const key = `${id},${componentName}`

        set(state =>
            produce(state, state => {
                let set = state.listeners.get(key)

                if (set === undefined) {
                    set = new Set()
                    state.listeners.set(key, set)
                }

                set.add(f)
            }),
        )

        return () => {
            set(state =>
                produce(state, state => {
                    state.listeners.get(key)?.delete(f)
                }),
            )
        }
    },
})

export function useEntityEvent<T extends keyof EntityComponents>(
    id: string,
    componentName: T,
    f: (x: EntityComponents[T]) => void,
) {
    const fRef = useRef(f)

    useEffect(() => {
        fRef.current = f
    }, [f])

    useEffect(() => {
        const fWrapped = (x: EntityComponents[T]) => fRef.current(x)
        return useEditorStore.getState().listen(id, componentName, fWrapped)
    }, [id, componentName])
}

export function invokeEntityEvent<T extends keyof EntityComponents>(
    id: string,
    componentName: T,
    component: EntityComponents[T],
) {
    useEditorStore.getState().invoke(id, componentName, component)
}

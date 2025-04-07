import { createContext, useContext, useEffect, useRef } from "react"
import { EditorEntity } from "./world"

export function useEntityEvent<T extends keyof EntityComponentEvents>(
    key: string,
    componentName: T,
    f: (x: EntityComponentEvents[T]) => void,
) {
    const editorEvents = useContext(editorEventsContext)

    if (editorEvents === undefined) {
        throw new Error("Failed to find editor events context")
    }

    const fRef = useRef(f)

    useEffect(() => {
        fRef.current = f
    }, [f])

    useEffect(
        () => editorEvents.listen(key, componentName, x => fRef.current(x)),
        [key, componentName, editorEvents],
    )
}

export const editorEventsContext = createContext<EditorEventStore | undefined>(undefined)

export class EditorEventStore {
    private listeners: Map<string, Map<string, Set<(data: any) => void>>> = new Map()

    listen<T extends keyof EntityComponentEvents>(
        key: string,
        componentName: T,
        f: (x: EntityComponentEvents[T]) => void,
    ): () => void {
        if (this.listeners.has(key) === false) {
            this.listeners.set(key, new Map())
        }

        const keyListeners = this.listeners.get(key)!

        if (keyListeners.has(componentName as string) === false) {
            keyListeners.set(componentName as string, new Set())
        }

        const componentListeners = keyListeners.get(componentName as string)!
        componentListeners.add(f)

        return () => void componentListeners.delete(f)
    }

    invoke<T extends keyof EntityComponentEvents>(
        key: string,
        componentName: T,
        component: EntityComponentEvents[T],
    ) {
        const componentListeners = this.listeners.get(key)?.get(componentName as string)

        if (componentListeners) {
            componentListeners.forEach(callback => callback(component))
        }
    }
}

type EntityComponentEvents = {
    [K in keyof EntityComponents]: EntityComponents[K]
}

type EntityComponents = UnionToIntersectionWithout<EditorEntity, "type">

type UnionToIntersectionWithout<T, K extends keyof any> = (
    T extends any ? (x: Omit<T, K>) => void : never
) extends (x: infer R) => void
    ? R
    : never

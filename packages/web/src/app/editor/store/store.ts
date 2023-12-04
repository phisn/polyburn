import { MutableRefObject, createContext, useContext } from "react"
import { Point } from "runtime/src/model/point"
import { StoreApi, UseBoundStore, create } from "zustand"
import { shallow } from "zustand/shallow"
import { BehaviorEvent } from "../behaviors/behaviors"
import { StoreSliceFocus, createStoreSliceFocus } from "./store-slice-focus"
import { StoreSliceWorld, createStoreSliceWorld } from "./store-slice-world"

export interface EditorStore extends StoreSliceWorld, StoreSliceFocus {
    listeners: Map<number, MutableRefObject<(event: BehaviorEvent) => void>[]>

    contextMenu?: {
        element: () => JSX.Element
        point: Point
    }

    openContextMenu(point: Point, element: () => JSX.Element): void

    listen(id: number, listener: MutableRefObject<(event: BehaviorEvent) => void>): () => void
    publish(event: BehaviorEvent): void
}

export const createEditorStore = () =>
    create<EditorStore>((set, get, store) => ({
        ...createStoreSliceWorld(set, get, store),
        ...createStoreSliceFocus(set, get, store),

        highlighted: undefined,
        selected: [],

        listeners: new Map(),

        contextMenu: undefined,
        openContextMenu(point, element) {
            set(state => ({
                ...state,
                contextMenu: {
                    element,
                    point,
                },
            }))
        },
        listen(id, listener) {
            set(state => ({
                ...state,
                listeners: new Map(state.listeners).set(id, [
                    ...(state.listeners.get(id) ?? []),
                    listener,
                ]),
            }))

            return () => {
                set(state => {
                    const listeners = new Map(state.listeners)
                    listeners.delete(id)

                    return {
                        ...state,
                        listeners,
                    }
                })
            }
        },
        publish(event) {
            for (const listener of get().listeners.get(event.targetId) ?? []) {
                listener.current(event)
            }
        },
    }))

export const editorStoreContext = createContext<UseBoundStore<StoreApi<EditorStore>> | undefined>(
    undefined,
)

export function useEditorContext() {
    const store = useContext(editorStoreContext)

    if (store === undefined) {
        throw new Error("useEditorStore must be used within a EditorStoreProvider")
    }

    return store
}

export function useEditorStore<T>(selector: (store: EditorStore) => T) {
    return useEditorContext()(selector, shallow)
}

import { MutableRefObject, createContext, useContext } from "react"
import { Point } from "runtime/src/model/point"
import { Vector3 } from "three"
import { StoreApi, createStore, useStore } from "zustand"
import { BehaviorEvent } from "../behaviors/behaviors"
import { StoreSliceFocus, createStoreSliceFocus } from "./store-slice-focus"
import { StoreSliceWorld, createStoreSliceWorld } from "./store-slice-world"

export interface EditorStore extends StoreSliceWorld, StoreSliceFocus {
    listeners: Map<number, MutableRefObject<(event: BehaviorEvent) => void>[]>

    contextMenu?: {
        element: () => JSX.Element
        point: Point
    }

    zoomTargetOrientation: { inWorld: Vector3; inWindow: Point }
    zoomTarget: number

    openContextMenu(point: Point, element: () => JSX.Element): void
    closeContextMenu(): void

    listen(id: number, listener: MutableRefObject<(event: BehaviorEvent) => void>): () => void
    publish(event: BehaviorEvent): void

    setZoomTarget(zoom: number, orientation: { inWorld: Vector3; inWindow: Point }): void
}

export const createEditorStore = () =>
    createStore<EditorStore>((set, get, store) => ({
        ...createStoreSliceWorld(set, get, store),
        ...createStoreSliceFocus(set, get, store),

        listeners: new Map(),

        zoomTarget: 50,
        zoomTargetOrientation: { inWorld: new Vector3(), inWindow: new Vector3() },

        contextMenu: undefined,
        openContextMenu(point, element) {
            set(() => ({
                contextMenu: {
                    element,
                    point,
                },
            }))
        },
        closeContextMenu() {
            set(() => ({
                contextMenu: undefined,
            }))
        },
        listen(id, listener) {
            set(state => ({
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
        setZoomTarget(zoom, orientation) {
            set(() => ({
                zoomTarget: zoom,
                zoomTargetOrientation: orientation,
            }))
        },
    }))

export const editorStoreContext = createContext<StoreApi<EditorStore> | undefined>(undefined)

export function useEditorContext() {
    const store = useContext(editorStoreContext)

    if (store === undefined) {
        throw new Error("useEditorStore must be used within a EditorStoreProvider")
    }

    return store
}

export function useEditorStore<T>(selector: (store: EditorStore) => T) {
    return useStore(useEditorContext(), selector)
}

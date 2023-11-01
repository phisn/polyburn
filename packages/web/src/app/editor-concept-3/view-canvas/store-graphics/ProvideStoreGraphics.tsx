import { createContext, useMemo } from "react"
import { ObjectCanvasGraphics, ShapeCanvasGraphics } from "./store-graphics"

export interface StoreGraphicsState {
    objects: Map<number, ObjectCanvasGraphics>
    shapes: Map<number, ShapeCanvasGraphics>
}

export type CanvasGraphicsType = keyof StoreGraphicsState

export type InferCanvasGraphics<T> = T extends keyof StoreGraphicsState
    ? StoreGraphicsState[T] extends Map<any, infer V>
        ? V
        : never
    : never

export const canvasGraphicsContext = createContext<StoreGraphicsState | undefined>(undefined)

export function ProvideStoreGraphics() {
    const store = useMemo(() => {
        return {
            objects: new Map(),
            shapes: new Map(),
        }
    }, [])

    return <canvasGraphicsContext.Provider value={store} />
}

import { useContext, useEffect } from "react"
import {
    CanvasGraphicsType,
    InferCanvasGraphics,
    canvasGraphicsContext,
} from "./ProvideStoreGraphics"

export function useProvideGraphics<T extends CanvasGraphicsType>(
    id: number,
    type: T,
    graphics: InferCanvasGraphics<T>,
) {
    const store = useContext(canvasGraphicsContext)

    if (store === undefined) {
        throw new Error("Canvas graphics context not found")
    }

    useEffect(() => {
        store[type].set(id, graphics as any)

        return () => {
            store[type].delete(id)
        }
    }, [store, id, type, graphics])
}

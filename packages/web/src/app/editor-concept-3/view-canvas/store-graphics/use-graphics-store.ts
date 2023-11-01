import { useContext, useMemo } from "react"
import { canvasGraphicsContext } from "./ProvideStoreGraphics"
import { StoreGraphics } from "./store-graphics"

export function useCanvasGraphics(): StoreGraphics {
    const store = useContext(canvasGraphicsContext)

    if (store === undefined) {
        throw new Error("Canvas graphics context not found")
    }

    return useMemo(
        () => ({
            object: id => store.objects.get(id),
            shape: id => store.shapes.get(id),
        }),
        [store],
    )
}

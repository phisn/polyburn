import { createContext, useMemo } from "react"
import { ObjectCanvasGraphics, ShapeCanvasGraphics } from "./canvas-graphics"

export interface CanvasGraphicsStore {
    objects: Map<number, ObjectCanvasGraphics>
    shapes: Map<number, ShapeCanvasGraphics>
}

export const canvasGraphicsContext = createContext<CanvasGraphicsStore | undefined>(undefined)

export function ProvideCanvasGraphics() {
    const store = useMemo(() => {
        return {
            objects: new Map(),
            shapes: new Map(),
        }
    }, [])

    return <canvasGraphicsContext.Provider value={store} />
}

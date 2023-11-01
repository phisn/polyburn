import { Point } from "runtime/src/model/point"

export interface ObjectCanvasGraphics {
    hovered(hovered: boolean): void

    position(position: Point): void
    rotation(rotation: number): void
}

export interface ShapeCanvasGraphics {}

export interface StoreGraphics {
    object(id: number): ObjectCanvasGraphics | undefined
    shape(id: number): ShapeCanvasGraphics | undefined
}

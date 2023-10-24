import { Point } from "runtime/src/model/point"

export interface ObjectCanvasGraphics {
    hovered(hovered: boolean): void

    position(position: Point): void
    rotation(rotation: number): void
}

export interface ShapeCanvasGraphics {}

export interface CanvasGraphics {
    object(id: number): ObjectCanvasGraphics
    shape(id: number): CanvasGraphics
}

import { RefObject } from "react"
import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { Vector2 } from "three"
import { EditorComponents } from "../../editor-components"

interface ShapeRef {
    setHovered: (hovered: boolean) => void

    setPosition: (x: number, y: number) => void
    setRotation: (rotation: number) => void

    onBeforeGrap: () => void
    onGrapped: () => void

    isInside: (position: Point) => boolean
}

export interface ShapeVertex {
    position: Vector2
    color: number
}

export interface ShapeComponent {
    ref: RefObject<ShapeRef>
    vertices: ShapeVertex[]
}

export interface ShapeMovingVertexComponent {
    duplicate: {
        vertex: ShapeVertex
        otherIndex: number
    }
    newVertices: Point[]
}

export interface ShapeComponents {
    shape?: ShapeComponent
    shapeMovingVertexAction?: ShapeMovingVertexComponent
}

export type ShapeEntity = EntityWith<EditorComponents, "shape" | "object">

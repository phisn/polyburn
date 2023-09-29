import { RefObject } from "react"
import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { EditorComponents } from "../../editor-components"

interface ObjectRef {
    setHovered: (hovered: boolean) => void

    setPosition: (position: Point) => void
    setRotation: (rotation: number) => void

    onBeforeGrap: () => void
    onGrapped: () => void

    isInside: (position: Point) => boolean
}

export interface ObjectComponent {
    ref: RefObject<ObjectRef>

    size: { width: number; height: number }
    position: Point
    rotation: number
}

export interface ObjectMovingActionComponent {
    offsetPosition: Point
    offsetRotation: number

    position: Point
    rotation: number
}

export interface ObjectComponents {
    object?: ObjectComponent
    objectMovingAction?: ObjectMovingActionComponent
}

export type ObjectEntity = EntityWith<EditorComponents, "object">

import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { EditorComponents } from "../../editor-framework-base"
import { Mutation } from "../../mutation"

export interface ObjectVisuals {
    setHovered: (hovered: boolean) => void

    setPosition: (position: Point) => void
    setRotation: (rotation: number) => void
}

export interface ObjectComponent {
    visuals?: ObjectVisuals

    isInside: (point: Point) => boolean

    position: () => Point
    rotation: () => number
    size: () => { width: number; height: number }

    mutation(position: Point, rotation: number): Mutation
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

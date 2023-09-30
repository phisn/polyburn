import { EntityWith } from "runtime-framework"
import { Point } from "runtime/src/model/point"
import { EditorComponents } from "../../editor-framework-base"
import { Mutation } from "../../mutation"

export interface ObjectGraphics {
    hovered: (hovered: boolean) => void

    position: (position: Point) => void
    rotation: (rotation: number) => void
}

export interface ObjectComponent {
    graphics?: ObjectGraphics

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

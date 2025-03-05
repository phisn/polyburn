import { Vector3 } from "three"

export interface PipelineEvent {
    type: string

    position: Vector3

    positionInGrid: Vector3
    positionInWindow: { x: number; y: number }

    scroll: number

    leftButtonDown: boolean
    leftButtonClicked: boolean
    leftButtonReleased: boolean

    rightButtonDown: boolean
    rightButtonClicked: boolean
    rightButtonReleased: boolean

    shiftKey: boolean
    ctrlKey: boolean

    consumed: boolean
}

export const ConsumeEvent = Symbol("ConsumeEvent")

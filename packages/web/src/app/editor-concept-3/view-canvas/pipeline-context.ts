import { EditorWorld } from "../store-world/editor-world"
import { CanvasGraphics } from "./canvas-graphics"
import { PipelineMovingState } from "./pipeline-object/pipeline-moving-state"

export type PipelineState = "none" | PipelineMovingState

export interface Cursor {
    default(): void
    grabbable(): void
    grabbing(): void
}

export interface PipelineConext {
    cursor: Cursor
    state: { ref: PipelineState }
    store: EditorWorld
    graphics: CanvasGraphics
}

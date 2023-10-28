import { EditorWorld } from "../store-world/editor-world"
import { EditorStore } from "../store/editor-store"
import { CanvasGraphics } from "./canvas-graphics/canvas-graphics"
import { PipelineMovingState } from "./pipeline-object/pipeline-moving-state"

export const PipelineStateNone = { type: "none" } as const
export type PipelineState = typeof PipelineStateNone | PipelineMovingState

export interface Cursor {
    default(): void
    grabbable(): void
    grabbing(): void
}

export interface PipelineConext {
    cursor: Cursor
    state: { ref: PipelineState }
    graphics: CanvasGraphics

    world: EditorWorld
    store: EditorStore
}

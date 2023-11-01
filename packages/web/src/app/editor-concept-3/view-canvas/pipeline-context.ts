import { EditorWorld } from "../store-world/editor-world"
import { EditorStore } from "../store/editor-store"
import { PipelineMovingState } from "./pipeline-object/pipeline-moving-state"
import { CanvasGraphicsStore } from "./store-graphics/store-graphics"

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
    graphics: CanvasGraphicsStore

    world: EditorWorld
    store: EditorStore
}

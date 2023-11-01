import { PipelineMovingState } from "../../../components/object/pipeline-moving-state"
import { EditorStoreWorld } from "../../store-world/store-world"
import { EditorStore } from "../../store/editor-store"

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

    world: EditorStoreWorld
    store: EditorStore
}

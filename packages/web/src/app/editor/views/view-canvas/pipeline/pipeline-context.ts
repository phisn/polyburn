import { RootState as ThreeState } from "@react-three/fiber"
import { ComponentPipelineState } from "../../../behaviors/behavior-pipeline"
import { EditorStore } from "../../../store/store"
import { PipelineStateMovingCamera } from "../background/pipeline-state-moving-camera"

export const PipelineStateNone = { type: "none" } as const

export type PipelineState =
    | typeof PipelineStateNone
    | ComponentPipelineState
    | PipelineStateMovingCamera

export interface Cursor {
    default(): void
    grabbable(): void
    grabbing(): void
}

export interface PipelineContext {
    cursor: Cursor
    state: { ref: PipelineState }

    store: EditorStore
    three: ThreeState
}

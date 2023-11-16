import { RootState as ThreeState } from "@react-three/fiber"
import { ComponentPipelineState } from "../../../../components/behavior-pipeline-state"
import { EditorStoreWorld } from "../../../store-world/store-world"
import { EditorStore } from "../../../store/editor-store"
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

    world: EditorStoreWorld
    store: EditorStore
    three: ThreeState
}

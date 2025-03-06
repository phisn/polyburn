import { useStore } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { ConsumeEvent } from "../../../../editor/views/canvas/canvas-event"
import { usePipelineEvent } from "../../../../editor/views/canvas/use-canvas-event"
import { pipelineStageFactories as componentPipelineStages } from "../../../behaviors/behavior-pipeline"
import { useEditorContext } from "../../../store/store"
import { pipelineStageBackgroundDefault } from "../background/pipeline-stage-background-default"
import { pipelineStageBackgroundMoving } from "../background/pipeline-stage-background-moving"
import { PipelineContext } from "./pipeline-context"

const pipelineStages = [
    pipelineStageBackgroundMoving,
    ...componentPipelineStages,
    pipelineStageBackgroundDefault,
]

export function usePipeline() {
    const threeStoreContext = useStore()
    const editorStoreContext = useEditorContext()

    const state = useRef<PipelineContext["state"]>({ ref: { type: "none" } })

    const partialContext = useMemo(
        () => ({
            cursor: {
                default: () => void (document.body.style.cursor = "default"),
                grabbable: () => void (document.body.style.cursor = "grab"),
                grabbing: () => void (document.body.style.cursor = "grabbing"),
            },
        }),
        [],
    ) satisfies Partial<PipelineContext>

    usePipelineEvent(event => {
        const context = {
            ...partialContext,
            three: threeStoreContext.getState(),
            state: state.current,
            store: editorStoreContext.getState(),
        }

        for (const stage of pipelineStages) {
            context.store = editorStoreContext.getState()

            const result = stage(event, {
                ...context,
            })

            if (result === ConsumeEvent) {
                return
            }
        }
    })
}

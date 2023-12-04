import { useStore } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { pipelineStageFactories as componentPipelineStages } from "../../../behaviors/behavior-pipeline"
import { useEditorStore } from "../../../store/store"
import { pipelineStageBackgroundDefault } from "../background/pipeline-stage-background-default"
import { pipelineStageBackgroundMoving } from "../background/pipeline-stage-background-moving"
import { PipelineContext } from "./pipeline-context"
import { ConsumeEvent } from "./pipeline-event"
import { usePipelineEvent } from "./use-pipeline-event"

const pipelineStages = [
    pipelineStageBackgroundMoving,
    ...componentPipelineStages,
    pipelineStageBackgroundDefault,
]

export function usePipeline() {
    const threeStore = useStore()
    const store = useEditorStore(state => state)

    useEffect(() => {
        console.log("store changed")
    }, [store])

    const state = useRef<PipelineContext["state"]>({ ref: { type: "none" } })

    const context = useMemo(
        () => ({
            cursor: {
                default: () => void (document.body.style.cursor = "default"),
                grabbable: () => void (document.body.style.cursor = "grab"),
                grabbing: () => void (document.body.style.cursor = "grabbing"),
            },
            store,
        }),
        [store],
    ) satisfies Partial<PipelineContext>

    usePipelineEvent(event => {
        for (const stage of pipelineStages) {
            const result = stage(event, {
                ...context,
                state: state.current,
                three: threeStore.getState(),
            })

            if (result === ConsumeEvent) {
                console.log("consumed by " + stage)
                return
            }
        }
    })
}

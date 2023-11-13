import { useStore } from "@react-three/fiber"
import { useMemo } from "react"
import { pipelineStageFactories as componentPipelineStages } from "../../../../components/component-pipeline-stages"
import { useEditorWorld } from "../../../store-world/EditorWorldProvider"
import { useEditorStore } from "../../../store/EditorStoreProvider"
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
    const world = useEditorWorld()
    const store = useEditorStore(state => state)

    const context = useMemo(
        () => ({
            cursor: {
                default: () => void (document.body.style.cursor = "default"),
                grabbable: () => void (document.body.style.cursor = "grab"),
                grabbing: () => void (document.body.style.cursor = "grabbing"),
            },
            state: { ref: { type: "none" } },

            world,
            store,
        }),
        [world, store],
    ) satisfies Partial<PipelineContext>

    usePipelineEvent(event => {
        for (const stage of pipelineStages) {
            const result = stage(event, {
                ...context,
                three: threeStore.getState(),
            })

            if (result === ConsumeEvent) {
                return
            }
        }
    })
}

import { pipelineStageObjectDefault } from "./object/pipeline-stage-object-default"
import { pipelineStageObjectMoving } from "./object/pipeline-stage-object-moving"
import { pipelineStageObjectSelected } from "./object/pipeline-stage-object-selected"
import { PipelineStateMoving } from "./object/pipeline-state-moving"

export const pipelineStageFactories = [
    pipelineStageObjectDefault,
    pipelineStageObjectMoving,
    pipelineStageObjectSelected,
]

export type ComponentPipelineState = PipelineStateMoving

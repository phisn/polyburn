import { pipelineStageObjectDefault } from "./object/pipeline-stage-object-default"
import { pipelineStageObjectMoving } from "./object/pipeline-stage-object-moving"
import { pipelineStageObjectSelected } from "./object/pipeline-stage-object-selected"

export const pipelineStageFactories = [
    pipelineStageObjectDefault,
    pipelineStageObjectMoving,
    pipelineStageObjectSelected,
]

import { pipelineStageObjectDefault } from "./object/pipeline-stage-object-default"
import { pipelineStageObjectMoving } from "./object/pipeline-stage-object-moving"
import { PipelineStateMoving } from "./object/pipeline-state-moving"

export const pipelineStageFactories = [pipelineStageObjectMoving, pipelineStageObjectDefault]

export type ComponentPipelineState = PipelineStateMoving

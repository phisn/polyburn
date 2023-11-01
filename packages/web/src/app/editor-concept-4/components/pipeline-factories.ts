import { newObjectDefaultStage } from "./object/object-canvas-pipeline-default"
import { newObjectMovingStage } from "./object/object-canvas-pipeline-moving"
import { newObjectSelectedStage } from "./object/object-canvas-pipeline-selected"

export const PipelineFactories = [
    newObjectDefaultStage,
    newObjectMovingStage,
    newObjectSelectedStage,
]

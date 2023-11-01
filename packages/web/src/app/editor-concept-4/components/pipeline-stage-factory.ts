import { CanvasEvent } from "../modules/views/view-canvas/canvas-event"
import { PipelineConext } from "../modules/views/view-canvas/pipeline-context"

export type PipelineStageFactory = (context: PipelineConext) => (event: CanvasEvent) => void

import { CanvasEvent } from "./canvas-event"
import { PipelineConext } from "./pipeline-context"

export type PipelineStageFactory = (context: PipelineConext) => (event: CanvasEvent) => void

import { CanvasEvent, ConsumeEvent } from "../../../../__editor/views/canvas/canvas-event"
import { PipelineContext } from "./pipeline-context"

export type PipelineStage = (
    event: CanvasEvent,
    context: PipelineContext,
) => typeof ConsumeEvent | void

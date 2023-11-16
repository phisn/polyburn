import { PipelineContext } from "./pipeline-context"
import { ConsumeEvent, PipelineEvent } from "./pipeline-event"

export type PipelineStage = (
    event: PipelineEvent,
    context: PipelineContext,
) => typeof ConsumeEvent | void

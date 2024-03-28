import { ImmutableEntityWith } from "../../entities/entity"
import { ConsumeEvent } from "../../views/view-canvas/pipeline/pipeline-event"
import { PipelineStage } from "../../views/view-canvas/pipeline/pipeline-stage"
import { pipelineStageObjectMoving } from "./pipeline-stage-object-moving"

export const pipelineStageObjectDefault: PipelineStage = (event, context) => {
    const { cursor, state, store } = context

    if (event.type === "wheel") {
        return
    }

    for (const entity of store.entitiesWith("object")) {
        const isInside = entity.object.isInside(event.position)

        if (isInside) {
            store.highlight({
                type: "object-highlight",
                targetId: entity.id,
            })

            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    cursor.grabbing()

                    updateStateToMoving(entity)
                } else {
                    cursor.grabbable()
                }
            } else if (event.leftButtonClicked) {
                store.select(entity.id)
            }

            return ConsumeEvent
        }
    }

    function updateStateToMoving(entity: ImmutableEntityWith<"object">) {
        state.ref = {
            type: "moving",

            entries: [
                {
                    entity,
                    offsetPosition: {
                        x: entity.object.position.x - event.positionInGrid.x,
                        y: entity.object.position.y - event.positionInGrid.y,
                    },
                    offsetRotation: entity.object.rotation,

                    position: entity.object.position,
                    rotation: entity.object.rotation,
                },
            ],
        }

        pipelineStageObjectMoving(event, context)
    }
}

import { ImmutableEntity, ImmutableEntityWith } from "../../entities/entity"
import { ConsumeEvent } from "../../modules/views/view-canvas/pipeline/pipeline-event"
import { PipelineStage } from "../../modules/views/view-canvas/pipeline/pipeline-stage"
import { MovingEntityEntry } from "./pipeline-state-moving"

export const pipelineStageObjectSelected: PipelineStage = (
    event,
    { cursor, state, store, world },
) => {
    for (const entity of world.entitiesWithComponents("object")) {
        if (entity.object.isInside(event.position)) {
            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    cursor.grabbing()

                    updateStateToMoving()
                } else {
                    cursor.grabbable()
                }
            }

            return ConsumeEvent
        }
    }

    function updateStateToMoving() {
        const entries: MovingEntityEntry[] = store.selected
            .map(id => world.entities().get(id))
            .filter((entity): entity is ImmutableEntity => entity !== undefined)
            .filter((entity): entity is ImmutableEntityWith<"object"> => "object" in entity)
            .map(entity => ({
                entity,
                offsetPosition: {
                    x: entity.object.position.x - event.positionInGrid.x,
                    y: entity.object.position.y - event.positionInGrid.y,
                },
                offsetRotation: entity.object.rotation,

                position: entity.object.position,
                rotation: entity.object.rotation,
            }))

        state.ref = {
            type: "moving",
            entries,
        }
    }
}

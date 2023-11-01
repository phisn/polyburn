import { ImmutableEntityWith } from "../../entities/entity"
import { ConsumeEvent } from "../../modules/views/view-canvas/canvas-event"
import { PipelineStageFactory } from "../pipeline-stage-factory"

export const newObjectDefaultStage: PipelineStageFactory =
    ({ cursor, state, store, world }) =>
    event => {
        for (const entity of world.entitiesWithComponents("object")) {
            const isInside = entity.object.isInside(event.position)

            if (isInside) {
                store.publish({
                    type: "object-hover",
                    entity,
                })

                if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        updateStateToMoving(entity)
                    } else {
                        cursor.grabbable()
                    }
                } else if (event.leftButtonClicked) {
                    store.setSelected([entity.id])
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
        }
    }

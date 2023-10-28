import { ImmutableEntityWith } from "../../store-world/models/entity"
import { ConsumeEvent } from "../canvas-event"
import { PipelineStageFactory } from "../pipeline"

export const newObjectDefaultStage: PipelineStageFactory =
    ({ cursor, graphics, state, store, world }) =>
    event => {
        for (const entity of world.entitiesWithComponents("object")) {
            const isInside = entity.object.isInside(event.position)

            graphics.object(entity.id).hovered(isInside)

            if (isInside) {
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
        }
    }

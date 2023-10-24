import { ConsumeEvent } from "../canvas-event"
import { PipelineStageFactory } from "../pipeline"

export const newObjectDefaultStage: PipelineStageFactory =
    ({ store, cursor, graphics, state }) =>
    event => {
        for (const entity of store.entitiesWithComponents("object")) {
            const isInside = entity.object.isInside(event.position)

            graphics.object(entity.id).hovered(isInside)

            if (isInside) {
                if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()

                        state.ref = {
                            entity,

                            offsetPosition: {
                                x: entity.object.position.x - event.positionInGrid.x,
                                y: entity.object.position.y - event.positionInGrid.y,
                            },
                            offsetRotation: entity.object.rotation,

                            position: entity.object.position,
                            rotation: entity.object.rotation,
                        }
                    } else {
                        cursor.grabbable()
                    }
                } else if (event.leftButtonClicked) {
                    entity.components.selected = {}
                }

                return ConsumeEvent
            }
        }
    }

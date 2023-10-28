import { ImmutableEntity, ImmutableEntityWith } from "../../store-world/models/entity"
import { ConsumeEvent } from "../canvas-event"
import { PipelineStageFactory } from "../pipeline"
import { MovingEntityEntry } from "./pipeline-moving-state"

export const newSelectedObjectStage: PipelineStageFactory =
    ({ cursor, state, store, world }) =>
    event => {
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

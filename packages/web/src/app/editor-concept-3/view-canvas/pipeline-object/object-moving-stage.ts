import { EditorWorldState } from "../../store-world/models/editor-world"
import { EntityWith } from "../../store-world/models/entity"
import { ConsumeEvent } from "../canvas-event"
import { PipelineStageFactory } from "../pipeline"
import { findLocationForObject } from "./find-location-for-object"
import { MovingEntityEntry } from "./pipeline-moving-state"

export const newObjectDefaultStage: PipelineStageFactory =
    ({ cursor, graphics, state, world }) =>
    event => {
        if (state.ref.type !== "moving") {
            return
        }

        const { ref: movingState } = state

        if (event.leftButtonDown) {
            cursor.grabbing()

            if (tryClipObjectToShape()) {
                return ConsumeEvent
            }

            for (const entry of movingState.entries) {
                updateEntryPosition(entry)
                updateEntryGraphics(entry)
            }

            return ConsumeEvent
        } else {
            cursor.grabbable()

            world.mutate(moveEntitiesMutation)

            state.ref = { type: "none" }

            return ConsumeEvent
        }

        function tryClipObjectToShape() {
            if (movingState.entries.length !== 1) {
                return false
            }

            const [first] = movingState.entries

            if ("shape" in first.entity) {
                return false
            }

            const { rotation, position } = findLocationForObject(event, first.entity, [
                ...world.entitiesWithComponents("shape"),
            ])

            first.position = position
            first.rotation = rotation
        }

        function updateEntryPosition(entry: MovingEntityEntry) {
            entry.position = {
                x: event.positionInGrid.x + entry.offsetPosition.x,
                y: event.positionInGrid.y + entry.offsetPosition.y,
            }

            entry.rotation = 0
        }

        function updateEntryGraphics(entry: MovingEntityEntry) {
            graphics.object(entry.entity.id).position(entry.position)
            graphics.object(entry.entity.id).rotation(entry.rotation)
        }

        function moveEntitiesMutation(world: EditorWorldState) {
            movingState.entries
                .map(
                    entry =>
                        [
                            entry,
                            world.entities.get(entry.entity.id) as EntityWith<"object">,
                        ] as const,
                )
                .forEach(([entry, entity]) => {
                    entity.object.position = entry.position
                    entity.object.rotation = entry.rotation
                })
        }
    }

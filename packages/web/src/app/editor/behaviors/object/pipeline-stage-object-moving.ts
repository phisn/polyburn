import { EntityWith } from "../../entities/entity"
import { WorldState } from "../../store/model/world-state"
import { ConsumeEvent } from "../../views/view-canvas/pipeline/pipeline-event"
import { PipelineStage } from "../../views/view-canvas/pipeline/pipeline-stage"
import { findLocationForObject } from "./find-location-for-object"
import { MovingEntityEntry } from "./pipeline-state-moving"

export const pipelineStageObjectMoving: PipelineStage = (
    event,
    { cursor, store, state, entitiesInCacheWith },
) => {
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

            store.publish({
                type: "object-move",
                targetId: entry.entity.id,

                position: entry.position,
                rotation: entry.rotation,
            })
        }

        return ConsumeEvent
    } else {
        cursor.grabbable()

        store.mutate(moveEntitiesMutation)
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
            ...entitiesInCacheWith("shape"),
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

    function moveEntitiesMutation(world: WorldState) {
        movingState.entries
            .map(
                entry =>
                    [entry, world.entities.get(entry.entity.id) as EntityWith<"object">] as const,
            )
            .forEach(([entry, entity]) => {
                entity.object.position = entry.position
                entity.object.rotation = entry.rotation
            })
    }
}

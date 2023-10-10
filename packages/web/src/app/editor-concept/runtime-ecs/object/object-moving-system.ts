import { EntityWith } from "runtime-framework"
import { ConsumeEvent } from "../../../store/EventStore"
import { combineMutations } from "../../runtime-player/mutation"
import { EditorComponents, EditorSystemFactory } from "../base"
import { findLocationForObject } from "./find-location-for-object"

export const newDefaultObjectSystem: EditorSystemFactory = ({ store, mutation, cursor }) => {
    const objects = store.newSet("object", "objectMovingAction")
    const shapes = store.newSet("object", "shape")

    return ({ event }) => {
        if (objects.size() === 0) {
            return
        }

        if (event.leftButtonDown) {
            cursor.grabbing()

            if (objects.size() === 1) {
                const [first] = objects

                if (first.has("shape") === false) {
                    onMoveSingleNonShapeObject(first)
                    return ConsumeEvent
                }
            }

            onMoveObjects()

            return ConsumeEvent
        } else {
            cursor.grabbable()

            mutation.dispatch(
                combineMutations(
                    ...objects.map(entity =>
                        entity.components.object.mutation(
                            entity.components.objectMovingAction.position,
                            entity.components.objectMovingAction.rotation,
                        ),
                    ),
                ),
            )

            for (const entity of objects) {
                delete (entity.components as any).objectMovingAction
            }

            return ConsumeEvent
        }

        function onMoveObjects() {
            for (const object of objects) {
                object.components.objectMovingAction.position = {
                    x:
                        event.positionInGrid.x +
                        object.components.objectMovingAction.offsetPosition.x,
                    y:
                        event.positionInGrid.y +
                        object.components.objectMovingAction.offsetPosition.y,
                }

                object.components.objectMovingAction.rotation =
                    object.components.objectMovingAction.offsetRotation

                updateRef(object)
            }
        }

        function onMoveSingleNonShapeObject(
            single: EntityWith<EditorComponents, "object" | "objectMovingAction">,
        ) {
            const { rotation, position } = findLocationForObject(event, single, [...shapes])

            single.components.objectMovingAction.position = position
            single.components.objectMovingAction.rotation = rotation

            updateRef(single)
        }

        function updateRef(entity: EntityWith<EditorComponents, "object" | "objectMovingAction">) {
            entity.components.object.graphics?.position(
                entity.components.objectMovingAction.position,
            )
            entity.components.object.graphics?.rotation(
                entity.components.objectMovingAction.rotation,
            )
        }
    }
}

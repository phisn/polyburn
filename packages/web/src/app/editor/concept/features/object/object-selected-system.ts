import { ConsumeEvent } from "../../../store/EventStore"
import { EditorSystemFactory } from "../../editor-framework-base"

export const newSelectedObjectSystem: EditorSystemFactory = ({ store, cursor }) => {
    const objects = store.newSet("object", "selected")

    return ({ event }) => {
        for (const entity of objects) {
            if (entity.components.object.isInside(event.position)) {
                onInsideOne()
                return ConsumeEvent
            }
        }

        function onInsideOne() {
            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    for (const object of objects) {
                        cursor.grabbing()
                        object.components.objectMovingAction = {
                            offsetPosition: {
                                x: object.components.object.position().x - event.positionInGrid.x,
                                y: object.components.object.position().y - event.positionInGrid.y,
                            },
                            offsetRotation: object.components.object.rotation(),

                            position: object.components.object.position(),
                            rotation: object.components.object.rotation(),
                        }
                    }
                } else {
                    cursor.grabbable()
                }
            }
        }
    }
}

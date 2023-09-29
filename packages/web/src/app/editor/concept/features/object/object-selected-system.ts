import { ConsumeEvent } from "../../../store/EventStore"
import { EditorSystemFactory } from "../../editor-system-factory"

export const newSelectedObjectSystem: EditorSystemFactory = ({ store }) => {
    const objects = store.newSet("object", "selected")

    return ({ event }) => {
        for (const object of objects) {
            const isInside = object.components.object.ref.current?.isInside(event.position)

            if (isInside) {
                onInsideOne()
                return ConsumeEvent
            }
        }

        function onInsideOne() {
            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    for (const object of objects) {
                        object.components.object.ref.current?.onGrapped()
                        object.components.objectMovingAction = {
                            offsetPosition: {
                                x: object.components.object.position.x - event.positionInGrid.x,
                                y: object.components.object.position.y - event.positionInGrid.y,
                            },
                            offsetRotation: object.components.object.rotation,

                            position: object.components.object.position,
                            rotation: object.components.object.rotation,
                        }
                    }
                } else {
                    for (const object of objects) {
                        object.components.object.ref.current?.onBeforeGrap()
                    }
                }
            }
        }
    }
}

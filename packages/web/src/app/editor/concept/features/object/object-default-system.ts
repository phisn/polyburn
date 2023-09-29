import { ConsumeEvent } from "../../../store/EventStore"
import { EditorSystemFactory } from "../../editor-system-factory"

export const newDefaultObjectSystem: EditorSystemFactory = ({ store }) => {
    const objects = store.newSet("object")

    return ({ event }) => {
        for (const object of objects) {
            const objectRef = object.components.object.ref

            if (objectRef.current === null) {
                return
            }

            const isInside = objectRef.current.isInside(event.position)

            objectRef.current.setHovered(isInside)

            if (isInside) {
                if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        objectRef.current.onGrapped()
                        object.components.objectMovingAction = {
                            offsetPosition: {
                                x: object.components.object.position.x - event.positionInGrid.x,
                                y: object.components.object.position.y - event.positionInGrid.y,
                            },
                            offsetRotation: object.components.object.rotation,

                            position: object.components.object.position,
                            rotation: object.components.object.rotation,
                        }
                    } else {
                        objectRef.current.onBeforeGrap()
                    }
                } else if (event.leftButtonClicked) {
                    object.components.selected = {}
                }

                return ConsumeEvent
            }
        }
    }
}

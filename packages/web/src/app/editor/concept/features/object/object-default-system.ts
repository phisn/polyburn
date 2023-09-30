import { ConsumeEvent } from "../../../store/EventStore"
import { EditorSystemFactory } from "../../editor-framework-base"

export const newDefaultObjectSystem: EditorSystemFactory = ({ store, cursor }) => {
    const objects = store.newSet("object")

    return ({ event }) => {
        for (const entity of objects) {
            const object = entity.components.object
            const visuals = entity.components.object.visuals

            if (visuals === undefined) {
                return
            }

            const isInside = object.isInside(event.position)

            visuals.setHovered(isInside)

            if (isInside) {
                if (event.shiftKey) {
                    if (event.leftButtonClicked) {
                        cursor.grabbing()
                        entity.components.objectMovingAction = {
                            offsetPosition: {
                                x: entity.components.object.position().x - event.positionInGrid.x,
                                y: entity.components.object.position().y - event.positionInGrid.y,
                            },
                            offsetRotation: entity.components.object.rotation(),

                            position: entity.components.object.position(),
                            rotation: entity.components.object.rotation(),
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
}

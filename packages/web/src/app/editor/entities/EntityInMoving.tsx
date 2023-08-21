import { useRef } from "react"
import { Object3D } from "three"
import { EntityState } from "../models/EntityState"
import { Priority } from "../models/Priority"
import { useEditorStore } from "../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../store/EventStore"

export interface EntityModeMoving {
    type: "moving"
    offsetPosition: { x: number; y: number }
    dead: boolean
}

export function EntityInMoving(props: {
    entityRef: React.MutableRefObject<Object3D | undefined>
    state: EntityState
    mode: EntityModeMoving
    onCancel: () => void
}) {
    const entityRef = useRef<Object3D>()
    const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

    const dispatchMutation = useEditorStore(store => store.mutation)

    useEventListener(event => {
        if (!entityRef.current) {
            return
        }

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.onCancel()
            }

            return
        }

        if (event.leftButtonDown && event.shiftKey) {
            positionRef.current.x = props.mode.offsetPosition.x + event.positionInGrid.x
            positionRef.current.y = props.mode.offsetPosition.y + event.positionInGrid.y

            entityRef.current.position.set(
                positionRef.current.x,
                positionRef.current.y,
                Priority.Action,
            )

            window.document.body.style.cursor = "grabbing"
        } else {
            if (event.shiftKey) {
                window.document.body.style.cursor = "grab"
            }

            // dispatchMutation(shapeMove(props.state, positionRef.current))
            props.onCancel()
        }

        return ConsumeEvent
    }, Priority.Action)

    return <></>
}

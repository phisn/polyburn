import { useEffect, useRef } from "react"
import { Mesh } from "three"
import { MutatableShapeGeometry } from "../../../../web/src/app/editor/behaviors/shape/MutatableShapeGeometry"
import { Priority, SubPriority } from "../../../models/priority"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { ShapeMode } from "../Shape"
import { shapeMove } from "../mutations/shape-move"
import { ShapeState } from "../shape-state"

export interface ShapeModeMoving {
    type: "moving"
    offsetPosition: { x: number; y: number }

    dead?: boolean
}

export function ShapeInMoving(props: {
    state: ShapeState
    mode: ShapeModeMoving
    setMode: (mode: ShapeMode) => void
}) {
    const positionRef = useRef({ ...props.state.position })
    const meshRef = useRef<Mesh>(null!)
    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
        document.body.style.cursor = "grabbing"
    })

    const dispatchMutation = useEditorStore(store => store.mutation)

    useEventListener(
        event => {
            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }

                return
            }

            if (props.mode.dead) {
                return
            }

            if (event.leftButtonDown && event.shiftKey) {
                positionRef.current.x = props.mode.offsetPosition.x + event.positionInGrid.x
                positionRef.current.y = props.mode.offsetPosition.y + event.positionInGrid.y

                meshRef.current.position.set(
                    positionRef.current.x,
                    positionRef.current.y,
                    Priority.Action + SubPriority.Shape,
                )

                window.document.body.style.cursor = "grabbing"
            } else {
                props.mode.dead = true

                if (event.shiftKey) {
                    window.document.body.style.cursor = "grab"
                }

                dispatchMutation(shapeMove(props.state, positionRef.current))
                props.setMode({ type: "selected" })
            }

            return ConsumeEvent
        },
        Priority.Action + SubPriority.Shape,
        true,
    )

    return (
        <>
            <mesh
                frustumCulled={false}
                ref={meshRef}
                geometry={geometryRef.current}
                position={[
                    positionRef.current.x,
                    positionRef.current.y,
                    Priority.Action + SubPriority.Shape,
                ]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>
        </>
    )
}

import { useEffect, useRef, useState } from "react"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { Priority, SubPriority } from "../../../models/Priority"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { MutatableShapeGeometry } from "../MutatableShapeGeometry"
import { ShapeMode } from "../Shape"
import { ShapeState, isPointInsideShape } from "../ShapeState"

export interface ShapeModeNone {
    type: "none"
}

export function ShapeInNone(props: {
    state: ShapeState
    mode: ShapeModeNone
    setMode: (mode: ShapeMode) => void
}) {
    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    const [showShapeDialog, setShowShapeDialog] = useState<undefined | { x: number; y: number }>()
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
    })

    useEventListener(event => {
        if (showShapeDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowShapeDialog(undefined)
        }

        if (event.consumed) {
            setHovered(false)
            return
        }

        const isPointInside = isPointInsideShape(event.position, props.state)

        setHovered(isPointInside)

        if (isPointInside) {
            if (event.leftButtonClicked) {
                if (event.shiftKey) {
                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                    })
                } else {
                    props.setMode({ type: "selected" })
                }

                return ConsumeEvent
            } else if (event.rightButtonClicked) {
                setShowShapeDialog({
                    x: event.position.x + 0.1,
                    y: event.position.y - 0.1,
                })
            }

            return ConsumeEvent
        }
    }, Priority.Normal + SubPriority.Shape)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[
                    props.state.position.x,
                    props.state.position.y,
                    Priority.Normal + SubPriority.Shape,
                ]}
            >
                <meshBasicMaterial color={materialColor()} vertexColors />
            </mesh>

            {showShapeDialog && (
                <EntityContextMenu state={props.state} position={showShapeDialog} />
            )}
        </>
    )

    function materialColor() {
        if (hovered) {
            return "#aaaaaa"
        }

        return "white"
    }
}

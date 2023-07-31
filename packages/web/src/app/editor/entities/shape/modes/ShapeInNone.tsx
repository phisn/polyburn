import { useEffect, useRef, useState } from "react"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
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

    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
    })

    useEventListener(event => {
        if (event.consumed) {
            setHovered(false)
            console.log("event was consumed")
            return
        }

        const isPointInside = isPointInsideShape(event.position, props.state)
        console.log("is point inside", isPointInside, event.position, event.type)

        if (event.leftButtonClicked) {
            if (isPointInside) {
                if (event.shiftKey) {
                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                    })
                } else {
                    console.log("consume event of type", event.type)
                    props.setMode({ type: "selected" })
                }

                return ConsumeEvent
            }
        } else {
            setHovered(isPointInside)

            if (isPointInside) {
                if (event.shiftKey) {
                    document.body.style.cursor = "grab"
                }

                return ConsumeEvent
            }
        }
    }, Priority.Normal)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[props.state.position.x, props.state.position.y, Priority.Normal]}
            >
                <meshBasicMaterial color={materialColor()} vertexColors />
            </mesh>
        </>
    )

    function materialColor() {
        if (hovered) {
            return "#aaaaaa"
        }

        return "white"
    }
}

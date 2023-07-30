import { useEffect, useRef } from "react"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { useMutationDispatch } from "../../../store/WorldStore"
import { MutatableShapeGeometry } from "../MutatableShapeGeometry"
import { ShapeMode } from "../Shape"
import { ShapeState, ShapeVertex, resolveIntersectionAround } from "../ShapeState"
import { shapeChangeVertices } from "../mutations/shapeChangeVertices"

export interface ShapeModeVertex {
    type: "vertex"

    vertexIndex: number
    vertices: ShapeVertex[]
}

export function ShapeInVertex(props: {
    state: ShapeState
    mode: ShapeModeVertex
    setMode: (mode: ShapeMode) => void
}) {
    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    useEffect(() => {
        geometryRef.current.update(props.mode.vertices)
    })

    const dispatchMutation = useMutationDispatch()

    useEventListener(event => {
        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        if (event.leftButtonDown) {
            console.log("position in grid is: ", event.positionInGrid.x, event.positionInGrid.y)

            props.mode.vertices[props.mode.vertexIndex].position.set(
                event.positionInGrid.x,
                event.positionInGrid.y,
            )

            const intersection = resolveIntersectionAround(
                props.mode.vertexIndex,
                props.mode.vertices,
            )

            if (intersection === null) {
                props.setMode({ type: "selected" })
                return ConsumeEvent
            }

            if (intersection !== props.mode.vertexIndex) {
                /*
                const temp = verticesRef.current[intersection]
                verticesRef.current[intersection] = verticesRef.current[props.mode.vertexIndex]
                verticesRef.current[props.mode.vertexIndex] = temp
                */

                props.mode.vertexIndex = intersection
            }

            /*
            verticesRef.current[props.mode.vertexIndex].position.set(
                props.mode.vertices[props.mode.vertexIndex].position.x + props.state.position.x,
                props.mode.vertices[props.mode.vertexIndex].position.y + props.state.position.y,
                Priority.Action,
            )
            */

            console.log("update vertices: ", JSON.stringify(props.mode.vertices, null, 2))

            geometryRef.current.update(props.mode.vertices)
            window.document.body.style.cursor = "grabbing"
        } else {
            console.log("ShapeInVertex: left button up")
            dispatchMutation(shapeChangeVertices(props.state, props.mode.vertices))
            props.setMode({ type: "selected" })
            window.document.body.style.cursor = "grab"
        }

        return ConsumeEvent
    }, Priority.Action)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[props.state.position.x, props.state.position.y, Priority.Action]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>
        </>
    )
}

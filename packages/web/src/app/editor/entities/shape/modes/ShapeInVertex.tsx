import { useEffect, useRef } from "react"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { useMutationDispatch } from "../../../store/WorldStore"
import { MutatableShapeGeometry } from "../MutatableShapeGeometry"
import { ShapeMode } from "../Shape"
import {
    ShapeState,
    ShapeVertex,
    canRemoveVertex,
    resolveConflictsAround as resolveIntersectionsAround,
} from "../ShapeState"
import { shapeChangeVertices } from "../mutations/shapeChangeVertices"

export interface ShapeModeVertex {
    type: "vertex"

    vertexIndex: number
    vertices: ShapeVertex[]

    inBuffer?: ShapeVertex
    inBufferIndex?: number
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

            if (
                event.positionInGrid.x === props.mode.vertices[props.mode.vertexIndex].position.x &&
                event.positionInGrid.y === props.mode.vertices[props.mode.vertexIndex].position.y
            ) {
                return ConsumeEvent
            }

            props.mode.vertices[props.mode.vertexIndex].position.set(
                event.positionInGrid.x,
                event.positionInGrid.y,
            )

            let duplicateIndex = props.mode.vertices.findIndex(
                (x, i) =>
                    x.position.x === props.mode.vertices[props.mode.vertexIndex].position.x &&
                    x.position.y === props.mode.vertices[props.mode.vertexIndex].position.y &&
                    i !== props.mode.vertexIndex,
            )

            if (duplicateIndex !== -1) {
                if (!canRemoveVertex(props.mode.vertexIndex, props.mode.vertices)) {
                    props.setMode({ type: "selected" })
                    return ConsumeEvent
                }

                props.mode.inBuffer = props.mode.vertices[duplicateIndex]
                props.mode.vertices[duplicateIndex] = props.mode.vertices[props.mode.vertexIndex]

                props.mode.vertices.splice(props.mode.vertexIndex, 1)
                props.mode.vertexIndex =
                    props.mode.vertexIndex < duplicateIndex ? duplicateIndex - 1 : duplicateIndex
            } else {
                const intersection = resolveIntersectionsAround(
                    props.mode.vertexIndex,
                    props.mode.vertices,
                )

                if (intersection === null) {
                    props.setMode({ type: "selected" })
                    return ConsumeEvent
                }

                if (intersection !== props.mode.vertexIndex) {
                    props.mode.vertexIndex = intersection
                }
            }

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


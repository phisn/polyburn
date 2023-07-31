import { useEffect, useRef } from "react"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
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

    duplicate?: {
        vertex: ShapeVertex
        otherIndex: number
    }
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

    const dispatch = useEditorStore(store => store.mutation)

    useEventListener(event => {
        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        if (event.leftButtonDown) {
            const newPosition = {
                x: event.positionInGrid.x + props.state.position.x,
                y: event.positionInGrid.y + props.state.position.y,
            }

            if (
                newPosition.x === props.mode.vertices[props.mode.vertexIndex].position.x &&
                newPosition.y === props.mode.vertices[props.mode.vertexIndex].position.y
            ) {
                window.document.body.style.cursor = "grabbing"
                return ConsumeEvent
            }

            if (props.mode.duplicate) {
                const other = props.mode.vertices[props.mode.vertexIndex]
                props.mode.vertices[props.mode.vertexIndex] = props.mode.duplicate.vertex

                props.mode.vertices.splice(props.mode.duplicate.otherIndex, 0, other)
                props.mode.vertexIndex = props.mode.duplicate.otherIndex

                props.mode.duplicate = undefined
            }

            props.mode.vertices[props.mode.vertexIndex].position.set(newPosition.x, newPosition.y)

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

                props.mode.duplicate = {
                    vertex: props.mode.vertices[duplicateIndex],
                    otherIndex: props.mode.vertexIndex,
                }

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

            geometryRef.current.update(props.mode.vertices)
            window.document.body.style.cursor = "grabbing"
        } else {
            dispatch(shapeChangeVertices(props.state, props.mode.vertices))

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

import { useEffect, useRef } from "react"
import { Point } from "runtime/src/model/Point"
import { Mesh, MeshBasicMaterial } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightOverrideColor,
} from "../../../../../common/constants"
import { MutatableShapeGeometry } from "../../../../web/src/app/editor/behaviors/shape/MutatableShapeGeometry"
import { Priority, SubPriority } from "../../../models/priority"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { ShapeMode } from "../Shape"
import { shapeChangeVertices } from "../mutations/shape-change-vertices"
import {
    ShapeState,
    ShapeVertex,
    canRemoveVertex,
    resolveConflictsAround as resolveIntersectionsAround,
} from "../shape-state"

export interface ShapeModeVertex {
    type: "vertex"

    vertexIndex: number
    vertex: ShapeVertex

    insert: boolean
}

export function ShapeInVertex(props: {
    state: ShapeState
    mode: ShapeModeVertex
    setMode: (mode: ShapeMode) => void
}) {
    interface Duplicate {
        vertex: ShapeVertex
        otherIndex: number
    }

    const vertexIndexRef = useRef(props.mode.vertexIndex)
    const duplicateRef = useRef<Duplicate | undefined>(undefined)
    const verticesRef = useRef<ShapeVertex[]>([
        ...props.state.vertices.slice(0, vertexIndexRef.current),
        props.mode.vertex,
        ...props.state.vertices.slice(vertexIndexRef.current + (props.mode.insert ? 0 : 1)),
    ])

    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    useEffect(() => {
        geometryRef.current.update(verticesRef.current)
    })

    const dispatch = useEditorStore(store => store.mutation)

    const markerRef = useRef<Mesh>(null!)
    const markerMaterialRef = useRef<MeshBasicMaterial>(null!)

    function handlePoint(position: Point) {
        if (
            position.x === verticesRef.current[vertexIndexRef.current].position.x &&
            position.y === verticesRef.current[vertexIndexRef.current].position.y
        ) {
            window.document.body.style.cursor = "grabbing"
            return
        }

        if (duplicateRef.current) {
            const other = verticesRef.current[vertexIndexRef.current]
            verticesRef.current[vertexIndexRef.current] = duplicateRef.current.vertex

            verticesRef.current.splice(duplicateRef.current.otherIndex, 0, other)
            vertexIndexRef.current = duplicateRef.current.otherIndex

            duplicateRef.current = undefined
        }

        const previous = {
            x: verticesRef.current[vertexIndexRef.current].position.x,
            y: verticesRef.current[vertexIndexRef.current].position.y,
        }

        verticesRef.current[vertexIndexRef.current].position.x = position.x
        verticesRef.current[vertexIndexRef.current].position.y = position.y

        markerRef.current.position.set(
            position.x + props.state.position.x,
            position.y + props.state.position.y,
            Priority.Action + SubPriority.Shape,
        )

        const duplicateIndex = verticesRef.current.findIndex(
            (v, i) =>
                v.position.x === verticesRef.current[vertexIndexRef.current].position.x &&
                v.position.y === verticesRef.current[vertexIndexRef.current].position.y &&
                i !== vertexIndexRef.current,
        )

        if (duplicateIndex !== -1) {
            markerMaterialRef.current.color.set(highlightOverrideColor)

            if (!canRemoveVertex(vertexIndexRef.current, verticesRef.current)) {
                verticesRef.current[vertexIndexRef.current].position.x = previous.x
                verticesRef.current[vertexIndexRef.current].position.y = previous.y

                markerRef.current.position.set(
                    previous.x + props.state.position.x,
                    previous.y + props.state.position.y,
                    Priority.Action + SubPriority.Shape,
                )

                document.body.style.cursor = "not-allowed"

                return
            }

            duplicateRef.current = {
                vertex: verticesRef.current[duplicateIndex],
                otherIndex: vertexIndexRef.current,
            }

            verticesRef.current[duplicateIndex] = verticesRef.current[vertexIndexRef.current]

            verticesRef.current.splice(vertexIndexRef.current, 1)
            vertexIndexRef.current =
                vertexIndexRef.current < duplicateIndex ? duplicateIndex - 1 : duplicateIndex
        } else {
            markerMaterialRef.current.color.set(highlightColor)

            const intersection = resolveIntersectionsAround(
                vertexIndexRef.current,
                verticesRef.current,
            )

            if (intersection === null) {
                verticesRef.current[vertexIndexRef.current].position.x = previous.x
                verticesRef.current[vertexIndexRef.current].position.y = previous.y

                markerRef.current.position.set(
                    previous.x + props.state.position.x,
                    previous.y + props.state.position.y,
                    Priority.Action + SubPriority.Shape,
                )

                document.body.style.cursor = "not-allowed"

                return
            }

            if (intersection !== vertexIndexRef.current) {
                vertexIndexRef.current = intersection
            }
        }

        geometryRef.current.update(verticesRef.current)
        window.document.body.style.cursor = "grabbing"
    }

    useEventListener(
        event => {
            if (event.consumed) {
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    props.setMode({ type: "none" })
                }

                return
            }

            if (event.leftButtonDown) {
                handlePoint({
                    x: event.positionInGrid.x - props.state.position.x,
                    y: event.positionInGrid.y - props.state.position.y,
                })
            } else {
                dispatch(shapeChangeVertices(props.state, verticesRef.current))

                props.setMode({ type: "selected" })
                window.document.body.style.cursor = "grab"
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
                geometry={geometryRef.current}
                position={[
                    props.state.position.x,
                    props.state.position.y,
                    Priority.Action + SubPriority.Shape,
                ]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>

            <mesh
                position={[
                    verticesRef.current[vertexIndexRef.current].position.x + props.state.position.x,
                    verticesRef.current[vertexIndexRef.current].position.y + props.state.position.y,
                    Priority.Action + SubPriority.Shape,
                ]}
                ref={markerRef}
            >
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>
        </>
    )
}

import { useEffect, useRef } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh, MeshBasicMaterial } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightOverrideColor,
} from "../../../../../common/Values"
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
        ...props.state.vertices.slice(0, props.mode.vertexIndex),
        props.mode.vertex,
        ...props.state.vertices.slice(props.mode.vertexIndex + (props.mode.insert ? 0 : 1)),
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
            position.x === verticesRef.current[props.mode.vertexIndex].position.x &&
            position.y === verticesRef.current[props.mode.vertexIndex].position.y
        ) {
            window.document.body.style.cursor = "grabbing"
            return
        }

        if (duplicateRef.current) {
            const other = verticesRef.current[props.mode.vertexIndex]
            verticesRef.current[props.mode.vertexIndex] = duplicateRef.current.vertex

            verticesRef.current.splice(duplicateRef.current.otherIndex, 0, other)
            vertexIndexRef.current = duplicateRef.current.otherIndex

            duplicateRef.current = undefined
        }

        const previous = {
            x: verticesRef.current[props.mode.vertexIndex].position.x,
            y: verticesRef.current[props.mode.vertexIndex].position.y,
        }

        verticesRef.current[props.mode.vertexIndex].position.set(position.x, position.y)

        markerRef.current.position.set(
            position.x + props.state.position.x,
            position.y + props.state.position.y,
            Priority.Action,
        )

        let duplicateIndex = verticesRef.current.findIndex(
            (x, i) =>
                x.position.x === verticesRef.current[props.mode.vertexIndex].position.x &&
                x.position.y === verticesRef.current[props.mode.vertexIndex].position.y &&
                i !== props.mode.vertexIndex,
        )

        if (duplicateIndex !== -1) {
            markerMaterialRef.current.color.set(highlightOverrideColor)

            console.log(`got duplicate duplicateIndex: ${duplicateIndex}`)

            if (!canRemoveVertex(props.mode.vertexIndex, verticesRef.current)) {
                verticesRef.current[props.mode.vertexIndex].position.set(previous.x, previous.y)

                markerRef.current.position.set(
                    previous.x + props.state.position.x,
                    previous.y + props.state.position.y,
                    Priority.Action,
                )

                document.body.style.cursor = "not-allowed"

                return
            }

            duplicateRef.current = {
                vertex: verticesRef.current[duplicateIndex],
                otherIndex: props.mode.vertexIndex,
            }

            verticesRef.current[duplicateIndex] = verticesRef.current[props.mode.vertexIndex]

            verticesRef.current.splice(props.mode.vertexIndex, 1)
            vertexIndexRef.current =
                props.mode.vertexIndex < duplicateIndex ? duplicateIndex - 1 : duplicateIndex
        } else {
            markerMaterialRef.current.color.set(highlightColor)

            const intersection = resolveIntersectionsAround(
                props.mode.vertexIndex,
                verticesRef.current,
            )

            if (intersection === null) {
                verticesRef.current[props.mode.vertexIndex].position.set(previous.x, previous.y)

                markerRef.current.position.set(
                    previous.x + props.state.position.x,
                    previous.y + props.state.position.y,
                    Priority.Action,
                )

                document.body.style.cursor = "not-allowed"

                return
            }

            if (intersection !== props.mode.vertexIndex) {
                console.log(`resolving intersection at ${intersection}`)
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
        Priority.Action,
        true,
    )

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[props.state.position.x, props.state.position.y, Priority.Action]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>

            <mesh
                position={[
                    verticesRef.current[props.mode.vertexIndex].position.x + props.state.position.x,
                    verticesRef.current[props.mode.vertexIndex].position.y + props.state.position.y,
                    Priority.Action,
                ]}
                ref={markerRef}
            >
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>
        </>
    )
}

import { useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/Point"
import { Mesh, MeshBasicMaterial, Vector2 } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightDeleteColor,
    snapDistance,
} from "../../../../../common/constants"
import { MutatableShapeGeometry } from "../../../../web/src/app/editor/behaviors/shape/MutatableShapeGeometry"
import { EntityContextMenu } from "../../../components/GroupContextMenu"
import { Priority, SubPriority } from "../../../models/priority"
import { useEditorStore } from "../../../store/EditorStore"
import { ConsumeEvent, useEventListener } from "../../../store/EventStore"
import { ShapeMode } from "../Shape"
import { Vertex, VertexContext } from "../Vertex"
import { shapeRemoveVertex } from "../mutations/shape-remove-vertex"
import {
    ShapeState,
    averageColor,
    findClosestEdge,
    findClosestVertex,
    isPointInsideShape,
} from "../shape-state"

export interface ShapeModeSelected {
    type: "selected"
}

export function ShapeInSelected(props: {
    state: ShapeState
    mode: ShapeModeSelected
    setMode: (mode: ShapeMode) => void
}) {
    const [showVertexDialog, setShowVertexDialog] = useState<undefined | { vertexIndex: number }>()
    const [showShapeDialog, setShowShapeDialog] = useState<undefined | { x: number; y: number }>()

    const markerRef = useRef<Mesh>(null!)
    const markerMaterialRef = useRef<MeshBasicMaterial>(null!)

    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    const dispatch = useEditorStore(store => store.mutation)

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
    })

    function showMarker(point: Point, color: string) {
        markerMaterialRef.current.color.set(color)
        markerRef.current.visible = true
        markerRef.current.position.set(
            point.x,
            point.y,
            Priority.Selected + SubPriority.Shape + 0.001,
        )
    }

    function startVertexMode(vertexIndex: number, position: Point, color: number, insert: boolean) {
        props.setMode({
            type: "vertex",
            vertexIndex,
            vertex: {
                position: new Vector2(
                    position.x - props.state.position.x,
                    position.y - props.state.position.y,
                ),
                color,
            },
            insert,
        })
    }

    useEventListener(event => {
        if (showVertexDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowVertexDialog(undefined)
        }

        if (showShapeDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowShapeDialog(undefined)
        }

        // marker is invisible by default
        markerRef.current.visible = false

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        const closestVertex = findClosestVertex(props.state, event.position, snapDistance)

        if (closestVertex) {
            if (event.ctrlKey) {
                window.document.body.style.cursor = "pointer"

                if (event.leftButtonClicked) {
                    dispatch(shapeRemoveVertex(props.state, closestVertex.vertexIndex))
                } else {
                    showMarker(closestVertex.point, highlightDeleteColor)
                }

                return ConsumeEvent
            }

            if (event.leftButtonClicked) {
                geometryRef.current.update(props.state.vertices)

                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestVertex.vertexIndex,
                    closestVertex.point,
                    props.state.vertices[closestVertex.vertexIndex].color,
                    false,
                )
            } else if (event.rightButtonClicked) {
                setShowVertexDialog({ vertexIndex: closestVertex.vertexIndex })
            } else {
                window.document.body.style.cursor = "grab"
                showMarker(closestVertex.point, highlightColor)
            }

            return ConsumeEvent
        }

        const closestEdge = findClosestEdge([props.state], event.position, snapDistance)

        if (closestEdge) {
            if (event.leftButtonClicked) {
                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestEdge.edge[1],
                    closestEdge.point,
                    averageColor(
                        props.state.vertices[closestEdge.edge[0]].color,
                        props.state.vertices[closestEdge.edge[1]].color,
                    ),
                    true,
                )
            } else if (!event.ctrlKey) {
                window.document.body.style.cursor = "pointer"
                showMarker(closestEdge.point, highlightColor)
            }

            return ConsumeEvent
        }

        const isPointInside = isPointInsideShape(event.position, props.state)

        if (isPointInside) {
            if (event.shiftKey) {
                if (event.leftButtonClicked) {
                    props.setMode({
                        type: "moving",
                        offsetPosition: {
                            x: props.state.position.x - event.positionInGrid.x,
                            y: props.state.position.y - event.positionInGrid.y,
                        },
                    })
                }

                window.document.body.style.cursor = "grab"
            }

            if (event.rightButtonClicked) {
                setShowShapeDialog({
                    x: event.positionInGrid.x + 0.1,
                    y: event.positionInGrid.y - 0.1,
                })
            }

            return ConsumeEvent
        } else if (event.leftButtonClicked) {
            props.setMode({ type: "none" })
        }
    }, Priority.Selected + SubPriority.Shape)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[
                    props.state.position.x,
                    props.state.position.y,
                    Priority.Selected + SubPriority.Shape,
                ]}
            >
                <meshBasicMaterial vertexColors />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>

            {props.state.vertices.map((vertex, i) => (
                <Vertex
                    key={i}
                    position={[
                        vertex.position.x + props.state.position.x,
                        vertex.position.y + props.state.position.y,
                        Priority.Selected + SubPriority.Shape,
                    ]}
                />
            ))}

            {showVertexDialog && (
                <VertexContext
                    geometryRef={geometryRef}
                    state={props.state}
                    vertexIndex={showVertexDialog.vertexIndex}
                />
            )}

            {showShapeDialog && (
                <EntityContextMenu
                    state={props.state}
                    position={showShapeDialog}
                    onCancel={() => setShowShapeDialog(undefined)}
                />
            )}
        </>
    )
}

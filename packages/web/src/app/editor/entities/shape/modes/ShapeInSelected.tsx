import { useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh, MeshBasicMaterial, Vector2 } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightDeleteColor,
    snapDistance,
} from "../../../../../common/Values"
import { ConsumeEvent, Priority, useEventListener } from "../../../store/EventStore"
import { MutatableShapeGeometry } from "../MutatableShapeGeometry"
import { ShapeMode } from "../Shape"
import {
    ShapeState,
    ShapeVertex,
    averageColor,
    findClosestEdge,
    findClosestVertex,
    isPointInsideShape,
} from "../ShapeState"
import { Vertex, VertexContext } from "../Vertex"

export interface ShapeModeSelected {
    type: "selected"
}

export function ShapeInSelected(props: {
    state: ShapeState
    mode: ShapeModeSelected
    setMode: (mode: ShapeMode) => void
}) {
    const [showVertexDialog, setShowVertexDialog] = useState<undefined | { vertexIndex: number }>()

    const markerRef = useRef<Mesh>(null!)
    const markerMaterialRef = useRef<MeshBasicMaterial>(null!)

    const geometryRef = useRef<MutatableShapeGeometry>(new MutatableShapeGeometry())

    useEffect(() => {
        geometryRef.current.update(props.state.vertices)
    })

    function showMarker(point: Point, color: string) {
        markerMaterialRef.current.color.set(color)
        markerRef.current.visible = true
        markerRef.current.position.set(point.x, point.y, Priority.Selected + 0.001)
    }

    function startVertexMode(vertexIndex: number, vertex: ShapeVertex, insert: boolean) {
        const offset = insert ? 0 : 1

        props.setMode({
            type: "vertex",
            vertexIndex,
            vertices: [
                ...props.state.vertices.slice(0, vertexIndex),
                vertex,
                ...props.state.vertices.slice(vertexIndex + offset),
            ],
        })
    }

    useEventListener(event => {
        if (showVertexDialog && (event.leftButtonClicked || event.rightButtonClicked)) {
            setShowVertexDialog(undefined)
        }

        if (event.consumed) {
            if (event.leftButtonClicked || event.rightButtonClicked) {
                props.setMode({ type: "none" })
            }

            return
        }

        // marker is invisible by default
        markerRef.current.visible = false

        const closestVertex = findClosestVertex(props.state, event.position, snapDistance)

        if (closestVertex) {
            if (event.ctrlKey) {
                window.document.body.style.cursor = "pointer"

                if (event.leftButtonDown) {
                    props.state.vertices.splice(closestVertex.vertexIndex, 1)
                    geometryRef.current.update(props.state.vertices)
                } else {
                    showMarker(closestVertex.point, highlightDeleteColor)
                }

                return ConsumeEvent
            }

            if (event.leftButtonClicked) {
                props.state.vertices[closestVertex.vertexIndex].position.x =
                    event.positionInGrid.x - props.state.position.x
                props.state.vertices[closestVertex.vertexIndex].position.y =
                    event.positionInGrid.y - props.state.position.y

                geometryRef.current.update(props.state.vertices)

                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestVertex.vertexIndex,
                    {
                        ...props.state.vertices[closestVertex.vertexIndex],
                        position: new Vector2(closestVertex.point.x, closestVertex.point.y),
                    },
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

        const closestEdge = findClosestEdge(props.state, event.position, snapDistance)

        if (closestEdge) {
            if (event.leftButtonClicked) {
                window.document.body.style.cursor = "grabbing"
                startVertexMode(
                    closestEdge.edge[1],
                    {
                        position: new Vector2(closestEdge.point.x, closestEdge.point.y),
                        color: averageColor(
                            props.state.vertices[closestEdge.edge[0]].color,
                            props.state.vertices[closestEdge.edge[1]].color,
                        ),
                    },
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

            return ConsumeEvent
        } else if (event.leftButtonClicked) {
            props.setMode({ type: "none" })
        }
    }, Priority.Normal)

    return (
        <>
            <mesh
                frustumCulled={false}
                geometry={geometryRef.current}
                position={[props.state.position.x, props.state.position.y, Priority.Selected]}
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
                        Priority.Selected,
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
        </>
    )
}

import { useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh, MeshBasicMaterial, Vector2 } from "three"
import {
    baseZoomFactor,
    highlightColor,
    highlightDeleteColor,
    snapDistance,
} from "../../../../common/Values"
import { useEntity } from "../../store/EntityStore"
import {
    ConsumeEvent,
    Priority,
    useEventListener,
} from "../../store/EventStore"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"
import {
    ShapeState,
    averageColor,
    findClosestEdge,
    findClosestVertex,
    isPointInsideShape,
    resolveIntersection,
} from "./ShapeState"
import { Vertex, VertexContext } from "./Vertex"

export function Shape(props: { id: number }) {
    const state: ShapeState = useEntity(props.id)

    const [mode, setMode] = useState<Mode>({ type: "none" })
    const [hovered, setHovered] = useState(false)

    const meshRef = useRef<Mesh>(null!)
    const geometryRef = useRef(new MutatableShapeGeometry())
    const verticesRef = useRef<Mesh[]>([])

    const markerMaterialRef = useRef<MeshBasicMaterial>(null!)
    const markerRef = useRef<Mesh>(null!)

    function showMarker(point: Point, color: number) {
        markerMaterialRef.current.color.set(color)
        markerRef.current.visible = true
        markerRef.current.position.set(point.x, point.y, priority + 0.001)
    }

    const priority = mode.type === "none" ? Priority.Normal : Priority.Selected

    useEventListener(event => {
        // make marker invisible by default. only visible
        // if event triggers it
        markerRef.current.visible = false

        if (event.consumed) {
            setHovered(false)
            return
        }

        // reset cursor to default
        window.document.body.style.cursor = ""

        const isPointInside = isPointInsideShape(event.position, state)

        switch (mode.type) {
            case "none":
                if (event.leftButtonClicked) {
                    if (isPointInside) {
                        setMode({ type: "selected" })
                        return ConsumeEvent
                    }
                } else {
                    setHovered(isPointInside)

                    if (isPointInside) {
                        return ConsumeEvent
                    }
                }

                break

            case "vertexContextMenu":
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    setMode({ type: "selected" })
                }

            case "selected":
                const closestVertex = findClosestVertex(
                    state,
                    event.position,
                    snapDistance,
                )

                if (closestVertex) {
                    if (event.ctrlKey) {
                        window.document.body.style.cursor = "pointer"

                        if (event.leftButtonDown) {
                            state.vertices.splice(closestVertex.vertexIndex, 1)
                            geometryRef.current.update(state)
                        } else {
                            showMarker(
                                closestVertex.point,
                                highlightDeleteColor,
                            )
                        }

                        return ConsumeEvent
                    }

                    if (event.leftButtonClicked) {
                        state.vertices[closestVertex.vertexIndex].position.x =
                            event.position.x - state.position.x
                        state.vertices[closestVertex.vertexIndex].position.y =
                            event.position.y - state.position.y

                        verticesRef.current[
                            closestVertex.vertexIndex
                        ].position.set(
                            state.vertices[closestVertex.vertexIndex].position
                                .x + state.position.x,
                            state.vertices[closestVertex.vertexIndex].position
                                .y + state.position.y,
                            priority,
                        )

                        geometryRef.current.update(state)

                        window.document.body.style.cursor = "grabbing"
                        setMode({
                            type: "vertex",
                            vertexIndex: closestVertex.vertexIndex,
                        })
                    } else if (event.rightButtonClicked) {
                        setMode({
                            type: "vertexContextMenu",
                            vertexIndex: closestVertex.vertexIndex,
                        })
                    } else {
                        window.document.body.style.cursor = "grab"
                        showMarker(closestVertex.point, highlightColor)
                    }

                    return ConsumeEvent
                }

                const closestEdge = findClosestEdge(
                    state,
                    event.position,
                    snapDistance,
                )

                if (closestEdge) {
                    if (event.leftButtonClicked) {
                        state.vertices.splice(closestEdge.edge[1], 0, {
                            position: new Vector2(
                                event.position.x - state.position.x,
                                event.position.y - state.position.y,
                            ),
                            color: averageColor(
                                state.vertices[closestEdge.edge[0]].color,
                                state.vertices[closestEdge.edge[1]].color,
                            ),
                        })

                        geometryRef.current.update(state)

                        window.document.body.style.cursor = "grabbing"
                        setMode({
                            type: "vertex",
                            vertexIndex: closestEdge.edge[1],
                        })
                    } else if (!event.ctrlKey) {
                        window.document.body.style.cursor = "pointer"
                        showMarker(closestEdge.point, highlightColor)
                    }

                    return ConsumeEvent
                }

                if (isPointInside) {
                    if (event.shiftKey) {
                        if (event.leftButtonClicked) {
                            setMode({
                                type: "moving",
                                start: {
                                    x: state.position.x - event.position.x,
                                    y: state.position.y - event.position.y,
                                },
                            })
                        }

                        window.document.body.style.cursor = "grab"
                    }

                    return ConsumeEvent
                } else if (event.leftButtonClicked) {
                    setMode({ type: "none" })
                }

                break
            case "moving":
                if (event.leftButtonDown) {
                    state.position.x = event.position.x + mode.start.x
                    state.position.y = event.position.y + mode.start.y

                    meshRef.current.position.set(
                        state.position.x,
                        state.position.y,
                        priority,
                    )

                    for (let i = 0; i < state.vertices.length; ++i) {
                        verticesRef.current[i].position.set(
                            state.vertices[i].position.x + state.position.x,
                            state.vertices[i].position.y + state.position.y,
                            priority,
                        )
                    }

                    window.document.body.style.cursor = "grabbing"
                } else {
                    if (event.shiftKey) {
                        window.document.body.style.cursor = "grab"
                    }

                    setMode({ type: "selected" })
                }

                return ConsumeEvent

            case "vertex":
                if (event.leftButtonDown) {
                    const intersection = resolveIntersection(
                        mode.vertexIndex,
                        {
                            x: event.position.x - state.position.x,
                            y: event.position.y - state.position.y,
                        },
                        state,
                    )

                    if (intersection !== null) {
                        const temp = verticesRef.current[intersection]
                        verticesRef.current[intersection] =
                            verticesRef.current[mode.vertexIndex]
                        verticesRef.current[mode.vertexIndex] = temp

                        mode.vertexIndex = intersection
                    }

                    state.vertices[mode.vertexIndex].position.x =
                        event.position.x - state.position.x
                    state.vertices[mode.vertexIndex].position.y =
                        event.position.y - state.position.y

                    verticesRef.current[mode.vertexIndex].position.set(
                        state.vertices[mode.vertexIndex].position.x +
                            state.position.x,
                        state.vertices[mode.vertexIndex].position.y +
                            state.position.y,
                        priority,
                    )

                    geometryRef.current.update(state)
                    window.document.body.style.cursor = "grabbing"
                } else {
                    setMode({ type: "selected" })
                    window.document.body.style.cursor = "grab"
                }

                return ConsumeEvent
        }
    }, priority)

    useEffect(() => {
        geometryRef.current.update(state)
    }, [])

    function Selected() {
        return (
            <>
                {state.vertices.map((vertex, i) => (
                    <Vertex
                        key={i}
                        position={[
                            vertex.position.x + state.position.x,
                            vertex.position.y + state.position.y,
                            priority,
                        ]}
                        ref={ref => (verticesRef.current[i] = ref as any)}
                    />
                ))}
            </>
        )
    }

    return (
        <>
            <mesh
                ref={meshRef}
                geometry={geometryRef.current}
                position={[state.position.x, state.position.y, priority]}
            >
                <meshBasicMaterial color={materialColor()} vertexColors />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>

            {mode.type === "vertexContextMenu" && (
                <VertexContext
                    geometryRef={geometryRef}
                    state={state}
                    vertexIndex={mode.vertexIndex}
                />
            )}
            {mode.type !== "none" && <Selected />}
        </>
    )

    function materialColor() {
        if (mode.type !== "none") {
            return "white"
        }

        if (hovered) {
            return "#aaaaaa"
        }

        return "white"
    }
}

interface ModeNone {
    type: "none"
}

interface ModeSelected {
    type: "selected"
}

interface ModeMoving {
    type: "moving"
    start: Point
}

interface ModeVertex {
    type: "vertex"
    vertexIndex: number
}

interface ModeVertexContextMenu {
    type: "vertexContextMenu"
    vertexIndex: number
}

type Mode =
    | ModeNone
    | ModeSelected
    | ModeMoving
    | ModeVertex
    | ModeVertexContextMenu

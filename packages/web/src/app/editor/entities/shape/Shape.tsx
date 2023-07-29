import { useState } from "react"
import { ShapeState } from "./ShapeState"
import { ShapeInMoving, ShapeModeMoving } from "./modes/ShapeInMoving"
import { ShapeInNone, ShapeModeNone } from "./modes/ShapeInNone"
import { ShapeInSelected, ShapeModeSelected } from "./modes/ShapeInSelected"
import { ShapeInVertex, ShapeModeVertex } from "./modes/ShapeInVertex"

/*
interface ShapeModeVertex {
    type: "vertex"

    vertexIndex: number
    vertices: ShapeVertex[]
}

interface ShapeModeVertexContextMenu {
    type: "vertexContextMenu"
    vertexIndex: number
}

interface ShapeModeMoving {
    type: "moving"
    offsetPosition: { x: number; y: number }
}

interface ShapeModeNone {
    type: "none"
}

interface ShapeModeSelected {
    type: "selected"
}
*/

export type ShapeMode = ShapeModeMoving | ShapeModeNone | ShapeModeSelected | ShapeModeVertex

export function Shape(props: { state: ShapeState }) {
    /*
    function startVertexMode(vertexIndex: number, position: Point, insert: boolean) {
        const offset = insert ? 0 : 1

        modeRef.current = {
            type: "vertex",
            vertexIndex,
            vertices: [
                ...props.state.vertices.slice(0, vertexIndex),
                {
                    ...props.state.vertices[vertexIndex],
                    position: new Vector2(position.x, position.y),
                },
                ...props.state.vertices.slice(vertexIndex + offset),
            ],
        }
    }
    */

    /*
    const priority =
        modeRef.current.type !== "none"
            ? Priority.Action
            : selected
            ? Priority.Selected
            : Priority.Normal

    const dispatch = useMutationDispatch()

    useEventListener((event, setPriority) => {
        // make marker invisible by default. only visible if event triggers it
        markerRef.current.visible = false

        if (event.consumed) {
            setHovered(false)
            return
        }

        const isPointInside = isPointInsideShape(event.position, props.state)

        const eventPositionInGrid = {
            x: Math.round(event.position.x / 0.2) * 0.2,
            y: Math.round(event.position.y / 0.2) * 0.2,
        }

        switch (modeRef.current.type) {
            case "none":
                if (selected) {
                } else {
                    if (event.leftButtonClicked) {
                        if (isPointInside) {
                            setSelected(true)
                            return ConsumeEvent
                        }
                    } else {
                        setHovered(isPointInside)

                        if (isPointInside) {
                            return ConsumeEvent
                        }
                    }
                }

                break

            case "vertexContextMenu":
                if (event.leftButtonClicked || event.rightButtonClicked) {
                    modeRef.current = { type: "none" }
                }

            // pass through

            case "selected":
                const closestVertex = findClosestVertex(props.state, event.position, snapDistance)

                if (closestVertex) {
                    if (event.ctrlKey) {
                        window.document.body.style.cursor = "pointer"

                        if (event.leftButtonDown) {
                            dispatch(shapeRemoveVertex(props.state, closestVertex.vertexIndex))
                        } else {
                            showMarker(closestVertex.point, highlightDeleteColor)
                        }

                        return ConsumeEvent
                    }

                    if (event.leftButtonClicked) {
                        window.document.body.style.cursor = "grabbing"
                        startVertexMode(closestVertex.vertexIndex, closestVertex.point, false)
                    } else if (event.rightButtonClicked) {
                        modeRef.current = {
                            type: "vertexContextMenu",
                            vertexIndex: closestVertex.vertexIndex,
                        }
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
                        startVertexMode(closestEdge.edge[0] + 1, closestEdge.point, true)
                    } else if (!event.ctrlKey) {
                        window.document.body.style.cursor = "pointer"
                        showMarker(closestEdge.point, highlightColor)
                    }

                    return ConsumeEvent
                }

                if (isPointInside) {
                    if (event.shiftKey) {
                        if (event.leftButtonClicked) {
                            modeRef.current = {
                                type: "moving",
                                offsetPosition: {
                                    x: props.state.position.x - event.positionInGrid.x,
                                    y: props.state.position.y - event.positionInGrid.y,
                                },
                            }
                        }

                        window.document.body.style.cursor = "grab"
                    }

                    return ConsumeEvent
                } else if (event.leftButtonClicked || event.rightButtonClicked) {
                }

                break
            case "moving":
                const target = {
                    x: event.positionInGrid.x + modeRef.current.offsetPosition.x,
                    y: event.positionInGrid.y + modeRef.current.offsetPosition.y,
                }

                if (event.leftButtonDown) {
                    meshRef.current.position.set(target.x, target.y, priority)

                    for (let i = 0; i < props.state.vertices.length; ++i) {
                        verticesRef.current[i].position.set(
                            props.state.vertices[i].position.x + target.x,
                            props.state.vertices[i].position.y + target.y,
                            priority,
                        )
                    }

                    window.document.body.style.cursor = "grabbing"
                } else {
                    dispatch(shapeMove(props.state, target))

                    if (event.shiftKey) {
                        window.document.body.style.cursor = "grab"
                    }

                    console.log(`changing mode to selected`)
                    modeRef.current = { type: "none" }
                }

                return ConsumeEvent

            case "vertex":
                if (event.leftButtonDown) {
                    modeRef.current.vertices[modeRef.current.vertexIndex].position.set(
                        eventPositionInGrid.x - props.state.position.x,
                        eventPositionInGrid.y - props.state.position.y,
                    )

                    const intersection = resolveIntersectionAround(
                        modeRef.current.vertexIndex,
                        modeRef.current.vertices,
                    )

                    if (intersection === null) {
                        modeRef.current = { type: "none" }
                        return ConsumeEvent
                    }

                    if (intersection !== modeRef.current.vertexIndex) {
                        const temp = verticesRef.current[intersection]
                        verticesRef.current[intersection] =
                            verticesRef.current[modeRef.current.vertexIndex]
                        verticesRef.current[modeRef.current.vertexIndex] = temp

                        modeRef.current.vertexIndex = intersection
                    }

                    verticesRef.current[modeRef.current.vertexIndex].position.set(
                        modeRef.current.vertices[modeRef.current.vertexIndex].position.x +
                            props.state.position.x,
                        modeRef.current.vertices[modeRef.current.vertexIndex].position.y +
                            props.state.position.y,
                        priority,
                    )

                    geometryRef.current.update(modeRef.current.vertices)
                    window.document.body.style.cursor = "grabbing"
                } else {
                    dispatch(shapeChangeVertices(props.state, modeRef.current.vertices))
                    modeRef.current = { type: "none" }
                    window.document.body.style.cursor = "grab"
                }

                return ConsumeEvent
        }
    }, priority)

    useEffect(() => {
        geometryRef.current.update(
            modeRef.current.type === "vertex" ? modeRef.current.vertices : props.state.vertices,
        )
    })

    const shapePosition =
        modeRef.current.type === "moving" && meshRef.current
            ? meshRef.current.position
            : new Vector3(props.state.position.x, props.state.position.y, priority)

    const shapeVertices =
        modeRef.current.type === "vertex" ? modeRef.current.vertices : props.state.vertices

    function Selected() {
        return
    }

    return (
        <>
            <mesh
                frustumCulled={false}
                ref={meshRef}
                geometry={geometryRef.current}
                position={shapePosition}
            >
                <meshBasicMaterial color={materialColor()} vertexColors />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial ref={markerMaterialRef} />
            </mesh>

            {modeRef.current.type === "vertexContextMenu" && (
                <VertexContext
                    geometryRef={geometryRef}
                    state={props.state}
                    vertexIndex={modeRef.current.vertexIndex}
                />
            )}
            {modeRef.current.type !== "none" && (
                <>
                    {shapeVertices.map((vertex, i) => (
                        <Vertex
                            key={i}
                            position={[
                                vertex.position.x + props.state.position.x,
                                vertex.position.y + props.state.position.y,
                                priority,
                            ]}
                            ref={ref => (verticesRef.current[i] = ref as any)}
                        />
                    ))}
                </>
            )}
        </>
    )

    function materialColor() {
        if (modeRef.current.type !== "none") {
            return "white"
        }

        if (hovered) {
            return "#aaaaaa"
        }

        return "white"
    }
    */

    const [mode, setMode] = useState<ShapeMode>({ type: "none" })

    return (
        <>
            {mode.type === "none" && (
                <ShapeInNone state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "moving" && (
                <ShapeInMoving state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "selected" && (
                <ShapeInSelected state={props.state} mode={mode} setMode={setMode} />
            )}
            {mode.type === "vertex" && (
                <ShapeInVertex state={props.state} mode={mode} setMode={setMode} />
            )}
        </>
    )
}

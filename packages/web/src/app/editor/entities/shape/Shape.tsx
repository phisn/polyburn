import { MeshProps } from "@react-three/fiber"
import { forwardRef, useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh, Vector2 } from "three"
import {
    baseZoomFactor,
    highlightColor,
    shapeColor,
    shapeColorHighlighted,
    shapeColorSelected,
    snapDistance,
} from "../../../../common/Values"
import { useEntity } from "../../store/EntityStore"
import {
    ConsumeEvent,
    Priority,
    useEventListener,
} from "../../store/EventStore"
import { MutatableShapeGeometry } from "./MutatableShapeGeometry"
import { ShapeState } from "./ShapeState"

const Vertex = forwardRef<Mesh, MeshProps>(function Vertex(props, ref) {
    return (
        <mesh ref={ref} {...props}>
            <circleGeometry args={[5 * baseZoomFactor]} />
            <meshBasicMaterial color="#222228" />

            <mesh>
                <circleGeometry args={[4 * baseZoomFactor]} />
                <meshBasicMaterial color="#C8DB35" />
            </mesh>
        </mesh>
    )
})

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

type Mode = ModeNone | ModeSelected | ModeMoving | ModeVertex

export function Shape(props: { id: number }) {
    const state: ShapeState = useEntity(props.id)

    const [mode, setMode] = useState<Mode>({ type: "none" })
    const [hovered, setHovered] = useState(false)

    const meshRef = useRef<Mesh>(null!)
    const geometryRef = useRef(new MutatableShapeGeometry())
    const verticesRef = useRef<Mesh[]>([])

    const markerRef = useRef<Mesh>(null!)

    function showMarker(point: Point) {
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
            case "selected":
                const closestVertex = findClosestVertex(
                    state,
                    event.position,
                    snapDistance,
                )

                if (closestVertex) {
                    if (event.leftButtonClicked) {
                        state.vertices[closestVertex.vertexIndex].x =
                            event.position.x - state.position.x
                        state.vertices[closestVertex.vertexIndex].y =
                            event.position.y - state.position.y

                        verticesRef.current[
                            closestVertex.vertexIndex
                        ].position.set(
                            state.vertices[closestVertex.vertexIndex].x +
                                state.position.x,
                            state.vertices[closestVertex.vertexIndex].y +
                                state.position.y,
                            priority,
                        )

                        geometryRef.current.update(state.vertices)

                        setMode({
                            type: "vertex",
                            vertexIndex: closestVertex.vertexIndex,
                        })
                    } else {
                        showMarker(closestVertex.point)
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
                        state.vertices.splice(
                            closestEdge.edge[1],
                            0,
                            new Vector2(
                                event.position.x - state.position.x,
                                event.position.y - state.position.y,
                            ),
                        )

                        geometryRef.current.update(state.vertices)

                        setMode({
                            type: "vertex",
                            vertexIndex: closestEdge.edge[1],
                        })
                    } else {
                        showMarker(closestEdge.point)
                    }

                    return ConsumeEvent
                }

                if (isPointInside) {
                    if (event.leftButtonClicked && event.shiftKey) {
                        setMode({
                            type: "moving",
                            start: {
                                x: state.position.x - event.position.x,
                                y: state.position.y - event.position.y,
                            },
                        })
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
                            state.vertices[i].x + state.position.x,
                            state.vertices[i].y + state.position.y,
                            priority,
                        )
                    }
                } else {
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

                    state.vertices[mode.vertexIndex].x =
                        event.position.x - state.position.x
                    state.vertices[mode.vertexIndex].y =
                        event.position.y - state.position.y

                    verticesRef.current[mode.vertexIndex].position.set(
                        state.vertices[mode.vertexIndex].x + state.position.x,
                        state.vertices[mode.vertexIndex].y + state.position.y,
                        priority,
                    )

                    geometryRef.current.update(state.vertices)
                } else {
                    setMode({ type: "selected" })
                }

                return ConsumeEvent
        }
    }, priority)

    useEffect(() => {
        geometryRef.current.update(state.vertices)
    }, [])

    function Selected() {
        return (
            <>
                {state.vertices.map((vertex, i) => (
                    <Vertex
                        key={i}
                        position={[
                            vertex.x + state.position.x,
                            vertex.y + state.position.y,
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
                <meshBasicMaterial color={materialColor()} />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial color={highlightColor} />
            </mesh>

            {mode.type !== "none" && <Selected />}
        </>
    )

    function materialColor() {
        if (mode.type !== "none") {
            return shapeColorSelected
        }

        if (hovered) {
            return shapeColorHighlighted
        }

        return shapeColor
    }
}

export function moveElementTo(array: any[], from: number, to: number) {
    if (to === from) {
        return
    }

    const target = array[from]

    if (to > from) {
        for (let i = from; i < to; ++i) {
            array[i] = array[i + 1]
        }
    } else {
        for (let i = from; i > to; --i) {
            array[i] = array[i - 1]
        }
    }

    array[to] = target

    return array
}

export function resolveIntersection(
    vertexIndex: number,
    moveTo: Point,
    shape: ShapeState,
) {
    function ccw(a: Point, b: Point, c: Point) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
    }

    function intersects(a: Point, b: Point, c: Point, d: Point) {
        return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)
    }

    for (let i = 0; i < shape.vertices.length; ++i) {
        const j = (i + 1) % shape.vertices.length

        if (i === vertexIndex || j === vertexIndex) {
            continue
        }

        if (
            intersects(
                shape.vertices[vertexIndex],
                moveTo,
                shape.vertices[i],
                shape.vertices[j],
            )
        ) {
            console.log(`before ${JSON.stringify(shape.vertices)}`)

            shape.vertices.splice(i + 1, 0, shape.vertices[vertexIndex])
            shape.vertices.splice(
                vertexIndex < i ? vertexIndex : vertexIndex + 1,
                1,
            )

            return vertexIndex < i ? i : i + 1
        }

        const left =
            (vertexIndex - 1 + shape.vertices.length) % shape.vertices.length
        const right = (vertexIndex + 1) % shape.vertices.length

        if (
            i !== left &&
            j !== left &&
            intersects(
                moveTo,
                shape.vertices[left],
                shape.vertices[i],
                shape.vertices[j],
            )
        ) {
            console.log(
                `i: ${i}, j: ${j}, left: ${left}, right: ${right} vertexIndex: ${vertexIndex}`,
            )
            shape.vertices.splice(i + 1, 0, shape.vertices[vertexIndex])
            shape.vertices.splice(
                vertexIndex < i ? vertexIndex : vertexIndex + 1,
                1,
            )

            return vertexIndex < i ? i : i + 1
        }

        if (
            i !== right &&
            j !== right &&
            intersects(
                moveTo,
                shape.vertices[right],
                shape.vertices[i],
                shape.vertices[j],
            )
        ) {
            console.log(
                `i: ${i}, j: ${j}, left: ${left}, right: ${right} vertexIndex: ${vertexIndex}`,
            )

            shape.vertices.splice(i + 1, 0, shape.vertices[vertexIndex])
            shape.vertices.splice(
                vertexIndex < i ? vertexIndex : vertexIndex + 1,
                1,
            )

            return vertexIndex < i ? i : i + 1
        }
    }

    return null
}

export function findIntersection(
    fromIndex: number,
    to: Point,
    shape: ShapeState,
) {
    const numVertices = shape.vertices.length

    let j = numVertices - 1

    const from = shape.vertices[fromIndex]

    function ccw(a: Point, b: Point, c: Point) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
    }

    for (let i = 0; i < numVertices; i++) {
        if (j === fromIndex || i === fromIndex) {
            continue
        }

        const from2 = shape.vertices[j]
        const to2 = shape.vertices[i]

        if (
            ccw(from, from2, to2) !== ccw(to, from2, to2) &&
            ccw(from, to, from2) !== ccw(from, to, to2)
        ) {
            return i
        }

        j = i
    }

    return null
}

export function isPointInsideShape(point: Point, shape: ShapeState): boolean {
    let isInside = false
    const numVertices = shape.vertices.length

    let j = numVertices - 1

    let vertexAtJ = {
        x: shape.vertices[j].x + shape.position.x,
        y: shape.vertices[j].y + shape.position.y,
    }

    for (let i = 0; i < numVertices; i++) {
        const vertexAtI = {
            x: shape.vertices[i].x + shape.position.x,
            y: shape.vertices[i].y + shape.position.y,
        }

        if (
            vertexAtI.y > point.y !== vertexAtJ.y > point.y &&
            point.x <
                ((vertexAtJ.x - vertexAtI.x) * (point.y - vertexAtI.y)) /
                    (vertexAtJ.y - vertexAtI.y) +
                    vertexAtI.x
        ) {
            isInside = !isInside
        }

        j = i
        vertexAtJ = vertexAtI
    }

    return isInside
}

export function findClosestEdge(
    shape: ShapeState,
    point: Point,
    snapDistance: number,
) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let edgeIndices: [number, number] = [0, 0]

    for (let j = 0; j < shape.vertices.length; ++j) {
        const p1 = {
            x: shape.vertices[j].x + shape.position.x,
            y: shape.vertices[j].y + shape.position.y,
        }

        const p2 = {
            x:
                shape.vertices[(j + 1) % shape.vertices.length].x +
                shape.position.x,
            y:
                shape.vertices[(j + 1) % shape.vertices.length].y +
                shape.position.y,
        }

        const closest = getClosestPointOnLine(p1, p2, point)
        const distance = getDistance(closest, point)

        if (distance < minDistance) {
            minDistance = distance
            closestPoint = closest
            edgeIndices = [j, (j + 1) % shape.vertices.length]
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return { point: closestPoint, edge: edgeIndices }
}

export function findClosestVertex(
    shape: ShapeState,
    point: Point,
    snapDistance: number,
) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let vertexIndex = 0

    for (let i = 0; i < shape.vertices.length; ++i) {
        const vertex = {
            x: shape.vertices[i].x + shape.position.x,
            y: shape.vertices[i].y + shape.position.y,
        }

        const distance = getDistance(vertex, point)

        if (distance < minDistance) {
            minDistance = distance
            closestPoint = vertex
            vertexIndex = i
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return {
        point: closestPoint,
        vertexIndex: vertexIndex,
    }
}

export function getClosestPointOnLine(p1: Point, p2: Point, point: Point) {
    const v = { x: p2.x - p1.x, y: p2.y - p1.y }
    const w = { x: point.x - p1.x, y: point.y - p1.y }
    const c1 = dotProduct(w, v)

    if (c1 <= 0) {
        return p1
    }

    const c2 = dotProduct(v, v)

    if (c2 <= c1) {
        return p2
    }

    const b = c1 / c2
    return { x: p1.x + b * v.x, y: p1.y + b * v.y }
}

export function dotProduct(a: Point, b: Point) {
    return a.x * b.x + a.y * b.y
}

export function getDistance(a: Point, b: Point) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}

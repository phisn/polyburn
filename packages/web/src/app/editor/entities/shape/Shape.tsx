import { forwardRef, useEffect, useRef, useState } from "react"
import { Point } from "runtime/src/model/world/Point"
import { Mesh } from "three"
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

const Vertex = forwardRef<Mesh>(function Vertex(_, ref) {
    return (
        <mesh ref={ref}>
            <circleGeometry args={[5 * baseZoomFactor]} />
            <meshBasicMaterial color="#222228" />

            <mesh>
                <circleGeometry args={[4 * baseZoomFactor]} />
                <meshBasicMaterial color="#C8DB35" />
            </mesh>
        </mesh>
    )
})

export function Shape(props: { id: number }) {
    const state: ShapeState = useEntity(props.id)

    const [selected, setSelected] = useState(false)
    const [hovered, setHovered] = useState(false)

    const meshRef = useRef<Mesh>(null!)
    const geometryRef = useRef(new MutatableShapeGeometry())
    const verticesRef = useRef<Mesh[]>([])

    const markerRef = useRef<Mesh>(null!)

    function showMarker(point: Point) {
        markerRef.current.visible = true
        markerRef.current.position.set(point.x, point.y, 0)
    }

    useEventListener(
        event => {
            const isPointInside = isPointInsideShape(event.position, state)

            // make marker invisible by default. only visible
            // if event triggers it
            markerRef.current.visible = false

            if (selected) {
                const closestVertex = findClosestVertex(
                    state,
                    event.position,
                    snapDistance,
                )

                if (closestVertex) {
                    showMarker(closestVertex.point)
                    return ConsumeEvent
                }

                const closestEdge = findClosestEdge(
                    state,
                    event.position,
                    snapDistance,
                )

                if (closestEdge) {
                    showMarker(closestEdge.point)
                    return ConsumeEvent
                }

                if (isPointInside) {
                    return ConsumeEvent
                }

                if (event.clicked) {
                    setSelected(false)
                }
            } else {
                if (event.clicked) {
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
        },
        selected ? Priority.Selected : Priority.Normal,
    )

    useEffect(() => {
        geometryRef.current.update(state.vertices)
    }, [])

    function Selected() {
        return (
            <>
                {state.vertices.map((vertex, i) => (
                    <Vertex
                        key={i}
                        ref={ref => (verticesRef.current[i] = ref!)}
                    />
                ))}
            </>
        )
    }

    return (
        <>
            <mesh ref={meshRef} geometry={geometryRef.current}>
                <meshBasicMaterial color={materialColor()} />
            </mesh>

            <mesh ref={markerRef} visible={false}>
                <circleGeometry args={[5.0 * baseZoomFactor]} />
                <meshBasicMaterial color={highlightColor} />
            </mesh>

            {selected && <Selected />}
        </>
    )

    function materialColor() {
        if (selected) {
            return shapeColorSelected
        }

        if (hovered) {
            return shapeColorHighlighted
        }

        return shapeColor
    }
}

export function isPointInsideShape(point: Point, shape: ShapeState): boolean {
    let isInside = false
    const numVertices = shape.vertices.length
    let j = numVertices - 1

    for (let i = 0; i < numVertices; i++) {
        if (
            shape.vertices[i].y > point.y !== shape.vertices[j].y > point.y &&
            point.x <
                ((shape.vertices[j].x - shape.vertices[i].x) *
                    (point.y - shape.vertices[i].y)) /
                    (shape.vertices[j].y - shape.vertices[i].y) +
                    shape.vertices[i].x
        ) {
            isInside = !isInside
        }

        j = i
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
        const p1 = shape.vertices[j]
        const p2 = shape.vertices[(j + 1) % shape.vertices.length]

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

    for (let j = 0; j < shape.vertices.length; ++j) {
        const distance = getDistance(shape.vertices[j], point)

        if (distance < minDistance) {
            minDistance = distance
            closestPoint = shape.vertices[j]
            vertexIndex = j
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


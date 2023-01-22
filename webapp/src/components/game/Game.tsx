import { Stage, Graphics } from "@inlet/react-pixi"
import { Container, InteractionEvent } from "pixi.js"
import { useCallback, useEffect, useState } from "react"
import { useRef } from "react"

interface Vertex {
    x: number
    y: number
}

interface Shape {
    vertices: Vertex[]
}

function findClosestVertex(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex | null = null;
    let shapeIndex: number | null = null;
    let vertexIndex: number | null = null;

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const distance = getDistance(shapes[i].vertices[j], point);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = shapes[i].vertices[j];
                shapeIndex = i;
                vertexIndex = j;
            }
        }
    }

    if (minDistance > snapDistance) {
        return null;
    }

    return { point: closestPoint, shape: shapeIndex, vertex: vertexIndex };
}

function findClosestEdge(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex | null = null;
    let shapeIndex: number | null = null;
    let edgeIndices: [ number, number] | null = null;

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const p1 = shapes[i].vertices[j];
            const p2 = shapes[i].vertices[(j + 1) % shapes[i].vertices.length];

            const closest = getClosestPointOnEdge(p1, p2, point);
            const distance = getDistance(closest, point);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = closest;

                shapeIndex = i;
                edgeIndices = [j, (j + 1) % shapes[i].vertices.length];
            }
        }
    }

    if (minDistance > snapDistance) {
        return null;
    }

    return { point: closestPoint, shapeIndex, edge: edgeIndices };
}

function getClosestPointOnEdge(p1: Vertex, p2: Vertex, point: Vertex) {
    const v = { x: p2.x - p1.x, y: p2.y - p1.y };
    const w = { x: point.x - p1.x, y: point.y - p1.y };
    const c1 = dotProduct(w, v);
    if (c1 <= 0) {
        return p1;
    }
    const c2 = dotProduct(v, v);
    if (c2 <= c1) {
        return p2;
    }
    const b = c1 / c2;
    return { x: p1.x + b * v.x, y: p1.y + b * v.y };
}

function dotProduct(a: Vertex, b: Vertex) {
    return a.x * b.x + a.y * b.y;
}

function getDistance(a: Vertex, b: Vertex) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Game() {
    const [shapes, setShapes] = useState<Shape[]>([])
    const [pointOnEdge, setPointOnEdge] = useState<Vertex | null>(null)

    useEffect(() => {
        setShapes([
            {
                vertices: [
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                    { x: 200, y: 200 },
                    { x: 100, y: 200 },
                ]
            },
            {
                vertices: [
                    { x: 300, y: 300 },
                    { x: 400, y: 300 },
                    { x: 400, y: 400 },
                    { x: 300, y: 400 },
                ]
            },
            {
                vertices: [
                    { x: 500, y: 500 },
                    { x: 600, y: 500 },
                    { x: 550, y: 600 },
                ]
            },
        ])
    }, [])

    useEffect(() => {
        window.addEventListener("mousemove", (e) => {
            const mouse = { x: e.clientX, y: e.clientY }

            // first find closest vertex than edge
            const closestVertex = findClosestVertex(shapes, mouse, 20)

            if (closestVertex) {
                setPointOnEdge(closestVertex.point)
                return
            }

            const closestEdge = findClosestEdge(shapes, mouse, 20)

            if (closestEdge) {
                setPointOnEdge(closestEdge.point)
                return
            }

            setPointOnEdge(null)
        })

        return () => {
            window.removeEventListener("mousemove", () => { })
        }
    }, [ ])

    const draw = useCallback((g) => {
        g.clear()

        shapes.forEach((shape) => {
            g.lineStyle(0)
            g.beginFill(0xff0000)
            g.drawPolygon(shape.vertices)
            g.endFill()
        })

        if (pointOnEdge) {
            g.lineStyle(0)
            g.beginFill(0x00ff00)
            g.drawCircle(pointOnEdge.x, pointOnEdge.y, 5)
            g.endFill()
        }

    }, [pointOnEdge, shapes])

    return (
        <div className="overflow-hidden">
            <Stage width={window.innerWidth} height={window.innerHeight} options={ { resizeTo: window } }>
                <Graphics draw={draw} />
            </Stage>
        </div>
    )
}

export default Game

/*
interface Vertex {
    x: number
    y: number
}

interface Shape {
    vertices: Vertex[]
}

function Game() {
    const [shapes, setShapes] = useState<Shape[]>([])

    const draw = useCallback((g) => {
        g.clear()

        shapes.forEach((shape) => {
            g.lineStyle(0)
            g.beginFill(0x000000)
            g.drawPolygon(shape.vertices)
            g.endFill()
        })

    }, [])

    return (
        <div className="overflow-hidden">
            <Stage width={window.innerWidth} height={window.innerHeight} options={ { resizeTo: window } }>
                <Graphics draw={draw} />
            </Stage>
        </div>
    )
}

export default Game
*/

import { Stage, Graphics } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback, useEffect, useState } from "react"
import { useRef } from "react"

interface Vertex {
    x: number
    y: number
}

interface Shape {
    vertices: Vertex[]
}

interface VertexIdentifier {
    point: Vertex
    shapeIndex: number
    vertexIndex: number
}
        
function findClosestVertex(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex = { x: 0, y: 0 };
    let shapeIndex: number = 0;
    let vertexIndex: number = 0;

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

    return { point: closestPoint, shapeIndex: shapeIndex, vertexIndex: vertexIndex };
}

function findClosestEdge(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex = { x: 0, y: 0 };
    let shapeIndex: number = 0;
    let edgeIndices: [ number, number] = [ 0, 0 ];

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

    return { point: closestPoint, shapeIndex: shapeIndex, edge: edgeIndices };
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

enum Mode {
    None,
    MoveVertex
}

const snapDistance = 20;

function Game() {
    const [shapes, setShapes] = useState<Shape[]>([])
    
    const [vertexSelected, setVertexSelected] = useState<VertexIdentifier | null>(null)
    const [highlightPoint, setHighlightPoint] = useState<Vertex | null>(null)
    
    const [mode, setMode] = useState<Mode>(Mode.None)

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
        const onMouseDown = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }

            const vertex = findClosestVertex(shapes, point, snapDistance)
            
            if (vertex) {
                if (e.ctrlKey) {
                    setShapes((shapes) => {
                        const newShapes = [...shapes]

                        if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                            newShapes.splice(vertex.shapeIndex, 1)
                            return newShapes
                        }

                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                        return newShapes
                    })
                    setVertexSelected(null)
                    setMode(Mode.None)
                    return
                }

                setVertexSelected(vertex)
                setMode(Mode.MoveVertex)
                return
            }

            const edge = findClosestEdge(shapes, point, snapDistance)

            if (edge) {
                setShapes((shapes) => {
                    const newShapes = [...shapes]
                    newShapes[edge.shapeIndex].vertices.splice(edge.edge[1], 0, edge.point)
                    return newShapes
                })

                setVertexSelected({ point: edge.point, shapeIndex: edge.shapeIndex, vertexIndex: edge.edge[1] })
                setMode(Mode.MoveVertex)
                return
            }

            setShapes((shapes) => {
                const newShapes = [...shapes]
                newShapes.push({
                    vertices: [
                        { x: point.x - 50, y: point.y - 50 },
                        { x: point.x + 50, y: point.y - 50 },
                        { x: point.x, y: point.y + 50 },
                    ]
                })
                return newShapes
            })

            setVertexSelected(null)
            setMode(Mode.None)
        }

        const onMouseUp = (e: MouseEvent) => {
            setVertexSelected(null)
            setMode(Mode.None)

            // log number of vertices
            console.log(shapes.map((s) => s.vertices.length))
        }

        window.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mouseup", onMouseUp)
        return () => {
            window.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mouseup", onMouseUp)
        }
    }, [ shapes ])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }

            if (mode === Mode.MoveVertex && vertexSelected) {
                // if holding shift then snap to grid
                if (e.shiftKey) {
                    point.x = Math.round(point.x / 20) * 20
                    point.y = Math.round(point.y / 20) * 20
                }

                setShapes((shapes) => {
                    const newShapes = [...shapes]
                    newShapes[vertexSelected.shapeIndex].vertices[vertexSelected.vertexIndex] = point
                    return newShapes
                })

                setHighlightPoint(point)

                console.log("move", vertexSelected, point)
            }
        }

        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [ vertexSelected, mode ])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }
            
            if (mode === Mode.None) {
                const vertex = findClosestVertex(shapes, point, snapDistance)

                if (vertex) {
                    console.log("vertex", vertex)
                    setHighlightPoint(vertex.point)
                    return
                }

                const edge = findClosestEdge(shapes, point, snapDistance)

                if (edge) {
                    setHighlightPoint(edge.point)
                    return
                }

                setHighlightPoint(null)
            }
        }

        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [ mode, shapes ])

    const draw = useCallback((g: PIXI.Graphics) => {
        g.clear()

        shapes.forEach((shape) => {
            g.lineStyle(0)
            g.beginFill(0xbb3333)
            g.drawPolygon(shape.vertices)
            g.endFill()

            g.lineStyle(0)
            g.beginFill(0x33bbbb)
            shape.vertices.forEach((v) => g.drawCircle(v.x, v.y, 4))
            g.endFill()
        })

        if (highlightPoint) {
            g.lineStyle(0)
            g.beginFill(0x00ff00)
            g.drawCircle(highlightPoint.x, highlightPoint.y, 5)
            g.endFill()
        }

    }, [ shapes, highlightPoint ])

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

import { Graphics } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback, useEffect, useState } from "react"
import { ActionProps } from "./ActionProps"
import {  Vertex, findClosestVertex, findClosestEdge, VertexIdentifier, Shape } from "./World"
import WorldGraphics from "./WorldGraphics"

enum Mode {
    None,
    MoveVertex
}

const snapDistance = 20

const MoveVertexIntermediateAction = (vertexSelected: VertexIdentifier, shape: Shape | null = null) => ({ world, setIntermediateAction, setWorld }: ActionProps) => {
    const [highlightPoint, setHighlightPoint] = useState<Vertex>(vertexSelected.point)
    const [shapesMutation, setShapesMutation] = useState<Shape>(shape ?? world.shapes[vertexSelected.shapeIndex])

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }

            setShapesMutation((shapesMutation) => {
                const newVertices = [...shapesMutation.vertices]
                newVertices[vertexSelected.vertexIndex] = point
                return { ...shapesMutation, vertices: newVertices }
            })

            setHighlightPoint(point)
        }

        window.addEventListener("mousemove", onMouseMove)
        return () => window.removeEventListener("mousemove", onMouseMove)
    }, [ setShapesMutation, vertexSelected ])

    useEffect(() => {
        const onMouseUp = (e: MouseEvent) => {
            setWorld((world) => {
                const newShapes = [...world.shapes]
                newShapes[vertexSelected.shapeIndex] = shapesMutation
                return { ...world, shapes: newShapes }
            })

            setIntermediateAction(null)
        }

        window.addEventListener("mouseup", onMouseUp)
        return () => window.removeEventListener("mouseup", onMouseUp)
    }, [ setWorld, setIntermediateAction, vertexSelected, shapesMutation ])

    const draw = useCallback((g: PIXI.Graphics) => {
        g.clear()

        for (let i = 0; i < world.shapes.length; i++) {
            g.lineStyle(0)
            g.beginFill(0xbb3333)

            if (vertexSelected.shapeIndex === i) {
                g.drawPolygon(shapesMutation.vertices)
            }
            else {
                g.drawPolygon(world.shapes[i].vertices)
            }

            g.endFill()
        }

        g.lineStyle(0)
        g.beginFill(0x00ff00)
        g.drawCircle(highlightPoint.x, highlightPoint.y, 5)
        g.endFill()
    }, [ world, shapesMutation, vertexSelected ])

    return (
        <>
            <WorldGraphics world={world} noRenderShapes={true} />
            <Graphics draw={draw} />
        </>
    )
}

function SelectionPassiveAction({ world, setIntermediateAction, setWorld }: ActionProps) {
    const [highlightPoint, setHighlightPoint] = useState<Vertex | null>(null)

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }
            const vertex = findClosestVertex(world.shapes, point, snapDistance)
            
            if (vertex) {
                if (e.ctrlKey) {
                    setWorld((world) => {
                        const newShapes = [...world.shapes]

                        if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                            newShapes.splice(vertex.shapeIndex, 1)
                            return { ...world, shapes: newShapes }
                        }

                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                        return { ...world, shapes: newShapes }
                    })

                    return
                }
                else {
                    setIntermediateAction(MoveVertexIntermediateAction(vertex))
                    return
                }
            }

            const edge = findClosestEdge(world.shapes, point, snapDistance)

            if (edge) {
                // Need to copy the shape because we're going to mutate it. We need to make sure to not mutate the original shape.
                const shape = { vertices: [...world.shapes[edge.shapeIndex].vertices] }
                shape.vertices.splice(edge.edge[1], 0, edge.point)

                setIntermediateAction(MoveVertexIntermediateAction(
                    { point: edge.point, shapeIndex: edge.shapeIndex, vertexIndex: edge.edge[1] },
                    { vertices: shape.vertices }
                ))

                return
            }

            setWorld((world) => {
                const newShapes = [...world.shapes]
                newShapes.push({
                    vertices: [
                        { x: point.x - 50, y: point.y - 50 },
                        { x: point.x + 50, y: point.y - 50 },
                        { x: point.x, y: point.y + 50 },
                    ]
                })
                return { ...world, shapes: newShapes }
            })
        }

        window.addEventListener("mousedown", onMouseDown)
        return () => window.removeEventListener("mousedown", onMouseDown)
    }, [ world ])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }
            const vertex = findClosestVertex(world.shapes, point, snapDistance)

            if (vertex) {
                setHighlightPoint(vertex.point)
                return
            }

            const edge = findClosestEdge(world.shapes, point, snapDistance)

            if (edge) {
                setHighlightPoint(edge.point)
                return
            }

            setHighlightPoint(null)
        }

        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [ world ])

    const draw = useCallback((g: PIXI.Graphics) => {
        g.clear()

        if (highlightPoint) {
            g.lineStyle(0)
            g.beginFill(0x00ff00)
            g.drawCircle(highlightPoint.x, highlightPoint.y, 5)
            g.endFill()
        }

    }, [ highlightPoint ])

    return (
        <>
            <WorldGraphics world={world} />
            <Graphics draw={draw} />
        </>
    )
}

export default SelectionPassiveAction

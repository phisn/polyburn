import { useEffect, useState } from "react"
import { EditorStore } from "../EditorStore"
import { findClosestEdge, findClosestVertex, Shape, VertexIdentifier } from "../World"

const snapDistance = 20

interface EditorMode {
    editorMenu: () => JSX.Element
    onClick: (x: number, y: number, ctrl: Boolean, shift: Boolean) => void
}

const moveVertexIntermediateAction = (store: EditorStore, vertexIndex: number, shapeIndex: number, shape: Shape) => ({
    onmousemove: (e: MouseEvent) => {
        let point = { x: e.clientX, y: e.clientY }

        if (e.shiftKey) {
            point = {
                x: Math.round(point.x / snapDistance) * snapDistance,
                y: Math.round(point.y / snapDistance) * snapDistance
            }
        }

        shape.vertices[vertexIndex] = point

        store.applyVisualMods({ 
            highlightVertices: [point],
            replaceShapeAt: { index: shapeIndex, shape }
        })
    },
    onmouseup: (e: MouseEvent) => {
        const point = { x: e.clientX, y: e.clientY }

        // clone world with new shape
        shape.vertices[vertexIndex] = point
        const shapes = [...store.world.shapes]
        shapes[shapeIndex] = shape
        store.setWorld({ ...store.world, shapes })
    }
})

interface IntermediateAction {
    onmousemove: (e: MouseEvent) => void
    onmouseup: (e: MouseEvent) => void
}

const useSelectionMode = (store: EditorStore) => {
    const [intermediateAction, setIntermediateAction] = useState<IntermediateAction | null>(null)

    useEffect(() => {
        if (intermediateAction) {
            const onMouseUp = (e: MouseEvent) => {
                intermediateAction.onmouseup(e)
                setIntermediateAction(null)
            }

            window.addEventListener("mousemove", intermediateAction.onmousemove)
            window.addEventListener("mouseup", onMouseUp)

            return () => {
                window.removeEventListener("mousemove", intermediateAction.onmousemove)
                window.removeEventListener("mouseup", onMouseUp)
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            const point = { x: e.clientX, y: e.clientY }
            const vertex = findClosestVertex(store.world.shapes, point, snapDistance)

            if (vertex) {
                store.applyVisualMods({ highlightVertices: [vertex.point]})
                return
            }

            const edge = findClosestEdge(store.world.shapes, point, snapDistance)

            if (edge) {
                store.applyVisualMods({ highlightVertices: [edge.point]})
                return
            }

            store.resetVisualMods()
        }

        window.addEventListener("mousemove", onMouseMove)
        return () => window.removeEventListener("mousemove", onMouseMove)
    }, [ intermediateAction, store.world ])

    return {
        editorMenu: () => {
            return (
                <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
                    <button className="btn">
                        Hello
                    </button>
                </div>
            )
        },
        onClick: (x: number, y: number, ctrl: boolean, shift: boolean) => {
            const point = { x, y }
            const vertex = findClosestVertex(store.world.shapes, point, snapDistance)
            
            if (vertex) {
                if (ctrl) {
                    const newShapes = [...store.world.shapes]

                    if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                        newShapes.splice(vertex.shapeIndex, 1)
                        store.setWorld({ ...store.world, shapes: newShapes })
                    }
                    else {
                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                        store.setWorld({ ...store.world, shapes: newShapes })
                    }

                    return
                }
                else {
                    setIntermediateAction(moveVertexIntermediateAction(
                        store, 
                        vertex.vertexIndex,
                        vertex.shapeIndex,
                        store.world.shapes[vertex.shapeIndex]
                    ))
                    return
                }
            }

            const edge = findClosestEdge(store.world.shapes, point, snapDistance)

            if (edge) {
                // Need to copy the shape because we're going to mutate it. We need to make sure to not mutate the original shape.
                const shape = { vertices: [...store.world.shapes[edge.shapeIndex].vertices] }
                shape.vertices.splice(edge.edge[1], 0, edge.point)

                setIntermediateAction(moveVertexIntermediateAction(store,
                    edge.edge[1],
                    edge.shapeIndex,
                    { vertices: shape.vertices }
                ))

                return
            }

            const newShapes = [...store.world.shapes]
            newShapes.push({
                vertices: [
                    { x: point.x - 50, y: point.y - 50 },
                    { x: point.x + 50, y: point.y - 50 },
                    { x: point.x, y: point.y + 50 },
                ]
            })

            store.setWorld({ ...store.world, shapes: newShapes })
        }
    }
}

export default useSelectionMode

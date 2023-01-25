import { AppProvider, useApp } from "@inlet/react-pixi"
import { useEffect, useState } from "react"
import useEditorStore, { EditorStore } from "../EditorStore"
import { findClosestEdge, findClosestVertex, Shape, VertexIdentifier } from "../World"
import PIXI from "pixi.js"

const snapDistance = 20

export interface EditorMode {
    editorMenu: () => JSX.Element
    onClick: (x: number, y: number, ctrl: boolean, shift: boolean) => void
}

type IntermediateEffect = () => () => void

function SelectionMode(props: { app: PIXI.Application }) {
    const store = useEditorStore()
    const app = props.app

    useEffect(() => {
        const onMouseMove = (e: PIXI.InteractionEvent) => {
            const point = { x: e.data.global.x, y: e.data.global.y }
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

        app.stage.on("mousemove", onMouseMove)
        return () => { app.stage.off("mousemove", onMouseMove) }
    }, [ app.stage, store.world ])

    return (
        <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
            <button className="btn">
                Hello
            </button>
        </div>
    )
}

function SelectionEditorMenu() {
    const state = useEditorStore()
} 

/*
const useSelectionMode = (store: EditorStore) => {
    const moveVertexIntermediateAction = (store: EditorStore, vertexIndex: number, shapeIndex: number, shape: Shape) => ({
        onKeydown: (e: KeyboardEvent) => {
            let point = 
        },
        onKeyup: (e: KeyboardEvent) => {
        },
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
            setIntermediateAction(null)
        }
    })

    useEffect(() => {
        if (intermediateAction) {
            const onMouseUp = (e: MouseEvent) => {
                intermediateAction.onmouseup(e)
                setIntermediateAction(null)
            }

            const onKeyDown = (e: KeyboardEvent) => {
                intermediateAction.onKeydown(e)

                if (e.key === "Escape") {
                    setIntermediateAction(null)
                    store.resetVisualMods()
                }
            }

            window.addEventListener("mousemove", intermediateAction.onmousemove)
            window.addEventListener("mouseup", onMouseUp)
            window.addEventListener("keydown", onKeyDown)
            window.addEventListener("keyup", intermediateAction.onKeyup)

            return () => {
                window.removeEventListener("mousemove", intermediateAction.onmousemove)
                window.removeEventListener("mouseup", onMouseUp)
                window.removeEventListener("keydown", onKeyDown)
                window.removeEventListener("keyup", intermediateAction.onKeyup)
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
        editorMenu: SelectionEditorMenu,
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
*/
export default SelectionMode

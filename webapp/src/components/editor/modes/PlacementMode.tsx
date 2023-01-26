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

function PlacementMode(props: { app: PIXI.Application }) {
    const store = useEditorStore()
    const { app } = props

    interface MovingVertexState {
        vertexIndex: number
        shapeIndex: number
        shape: Shape
    }

    const [movingVertex, setMovingVertex] = useState<MovingVertexState | undefined>(undefined)

    const moveVertexEffect = ({ vertexIndex, shapeIndex, shape }: MovingVertexState) => {
        const onMouseUp = (e: PIXI.InteractionEvent) => {
            let point = { x: e.data.global.x, y: e.data.global.y }

            if (e.data.originalEvent.shiftKey) {
                point = {
                    x: Math.round(point.x / snapDistance) * snapDistance,
                    y: Math.round(point.y / snapDistance) * snapDistance
                }
            }
    
            // clone world with new shape
            shape.vertices[vertexIndex] = point
            const shapes = [...store.world.shapes]
            shapes[shapeIndex] = shape

            store.mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...store.world.shapes]
                }),
                redo: () => ({
                    ...store.world,
                    shapes
                })
            })
            
            store.resetVisualMods()

            setMovingVertex(undefined)
        }

        const onMouseMoveRaw = (data: PIXI.InteractionData) => {
            let point = { x: data.global.x, y: data.global.y }
    
            if (data.originalEvent.shiftKey) {
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
        }

        const onMouseMove = (e: PIXI.InteractionEvent) => {
            // mouseup event is not fired when mouse is released outside of the canvas. This is a workaround.
            if (e.data.originalEvent instanceof MouseEvent && e.data.originalEvent.buttons === 0) {
                onMouseUp(e)
            }
            else {
                onMouseMoveRaw(e.data)
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                const point = { x: app.renderer.plugins.interaction.mouse.global.x, y: app.renderer.plugins.interaction.mouse.global.y }
                shape.vertices[vertexIndex] = point

                store.applyVisualMods({
                    highlightVertices: [point],
                    replaceShapeAt: { index: shapeIndex, shape }
                })
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                const point = {
                    x: Math.round(app.renderer.plugins.interaction.mouse.global.x / snapDistance) * snapDistance,
                    y: Math.round(app.renderer.plugins.interaction.mouse.global.y / snapDistance) * snapDistance
                }
                shape.vertices[vertexIndex] = point

                store.applyVisualMods({
                    highlightVertices: [point],
                    replaceShapeAt: { index: shapeIndex, shape }
                })
            }
        }

        onMouseMoveRaw(app.renderer.plugins.interaction.mouse)

        app.stage.on("mousemove", onMouseMove)
        app.stage.on("mouseup", onMouseUp)
        app.stage.on("mouseupoutside", onMouseUp)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("keydown", onKeyDown)

        return () => {
            app.stage.off("mousemove", onMouseMove)
            app.stage.off("mouseup", onMouseUp)
            app.stage.off("mouseupoutside", onMouseUp)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("keydown", onKeyDown)
        }
    }

    const defaultEffect = () => {
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

        const onMouseDown = (e: PIXI.InteractionEvent) => {
            const point = { x: e.data.global.x, y: e.data.global.y }
            const vertex = findClosestVertex(store.world.shapes, point, snapDistance)

            /*

            Adding a new shape looks like this:
                store.mutateWorld({
                    undo: previousWorld => ({
                        ...previousWorld,
                        shapes: [...store.world.shapes]
                    }),
                    redo: () => ({
                        ...store.world,
                        shapes: [...store.world.shapes, { vertices: 
                            [
                                { x: point.x - 50, y: point.y - 50 },
                                { x: point.x + 50, y: point.y - 50 },
                                { x: point.x, y: point.y + 50 },
                            ] 
                        }]
                    })
                })

            */
            
            if (vertex) {
                if (e.data.originalEvent.ctrlKey) {
                    const newShapes = [...store.world.shapes]

                    if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                        newShapes.splice(vertex.shapeIndex, 1)
                    }
                    else {
                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                    }
                    
                    store.mutateWorld({
                        undo: previousWorld => ({
                            ...previousWorld,
                            shapes: [...store.world.shapes]
                        }),
                        redo: () => ({
                            ...store.world,
                            shapes: newShapes
                        })
                    })

                    return
                }
                else {
                    setMovingVertex({
                        vertexIndex: vertex.vertexIndex,
                        shapeIndex: vertex.shapeIndex,
                        shape: { vertices: [...store.world.shapes[vertex.shapeIndex].vertices] }
                    })

                    return
                }
            }

            const edge = findClosestEdge(store.world.shapes, point, snapDistance)

            if (edge) {
                // Need to copy the shape because we're going to mutate it. We need to make sure to not mutate the original shape.
                const shape = { vertices: [...store.world.shapes[edge.shapeIndex].vertices] }
                shape.vertices.splice(edge.edge[1], 0, edge.point)

                setMovingVertex({
                    vertexIndex: edge.edge[1],
                    shapeIndex: edge.shapeIndex,
                    shape: { vertices: shape.vertices }
                })

                return
            }

            store.mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...store.world.shapes]
                }),
                redo: () => ({
                    ...store.world,
                    shapes: [...store.world.shapes, { vertices: 
                        [
                            { x: point.x - 50, y: point.y - 50 },
                            { x: point.x + 50, y: point.y - 50 },
                            { x: point.x, y: point.y + 50 },
                        ] 
                    }]
                })
            })
        }

        app.stage.on("mousemove", onMouseMove)
        app.renderer.plugins.interaction.on("mousedown", onMouseDown)
        return () => {
            app.stage.off("mousemove", onMouseMove)
            app.renderer.plugins.interaction.off("mousedown", onMouseDown)
        }
    }

    useEffect(() => {
        if (movingVertex) {
            return moveVertexEffect(movingVertex)
        }

        return defaultEffect()
    }, [ app.stage, movingVertex, store.world ])

    return (
        <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
            <button className="btn">
                Hello
            </button>
        </div>
    )
}

export default PlacementMode

import { AppProvider, useApp } from "@inlet/react-pixi"
import { useCallback, useEffect, useState } from "react"
import useEditorStore from "../EditorStore"
import { findClosestEdge, findClosestVertex, Shape, VertexIdentifier } from "../World"
import PIXI from "pixi.js"

import greenFlag from "../../../assets/flag-green.svg"
import redFlag from "../../../assets/flag-red.svg"
import { shallow } from "zustand/shallow"

const snapDistance = 20

const highlightColor = 0x33ff33
const highlightDeleteColor = 0xff2222
const highlightMoveColor = 0x00aaaa

export interface EditorMode {
    editorMenu: () => JSX.Element
    onClick: (x: number, y: number, ctrl: boolean, shift: boolean) => void
}

interface PlacableObject {
    src: string
    name: string
}

interface PlaceableObjectSelectProps {
    selected: PlacableObject | undefined
    onSelect: (obj: PlacableObject | undefined) => void
}

interface SinglePlaceableObjectProps {
    obj: PlacableObject
    selected: boolean
    onSelect: (obj: PlacableObject) => void
}

const SinglePlaceableObject = (props: SinglePlaceableObjectProps) => (
    <button
        onClick={() => props.onSelect(props.obj)} 
        className={`btn h-min ${props.selected ? "btn-active" : ""}`}>
        <div className="flex flex-col p-5 space-y-4 items-center">
            <img src={props.obj.src} className="pl-2 w-8" />
            <div>
                { props.obj.name }
            </div>
        </div>
    </button>
)

const PlaceableObjectSelect = (props: PlaceableObjectSelectProps) => {
    const onSelect = useCallback((obj: PlacableObject) => {
        if (props.selected?.src === obj.src) {
            props.onSelect(undefined)
        }
        else {
            props.onSelect(obj)
        }

    }, [ props.onSelect, props.selected ])

    const objects: PlacableObject[] = [
        { src: redFlag, name: "Red Flag" },
        { src: greenFlag, name: "Green Flag" },
    ]

    return (
        <div className="btn-group btn-group-vertical">
            { objects.map(obj => (
                <SinglePlaceableObject
                    key={obj.name}
                    obj={obj}
                    selected={props.selected?.src === obj.src}
                    onSelect={onSelect}
                />
            )) }
        </div>
    )
}

function PlacementMode(props: { app: PIXI.Application }) {
    const { app } = props

    const [
        mutateWorld,
        applyVisualMods,
        resetVisualMods,
        world
    ] = useEditorStore(state => [ state.mutateWorld, state.applyVisualMods, state.resetVisualMods, state.world ], shallow)

    interface MovingVertexState {
        vertexIndex: number
        shapeIndex: number
        shape: Shape
    }

    const [movingVertex, setMovingVertex] = useState<MovingVertexState | undefined>(undefined)
    const [placeObject, setPlaceObject] = useState<PlacableObject | undefined>(undefined)

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
            const shapes = [...world.shapes]
            shapes[shapeIndex] = shape

            mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...world.shapes]
                }),
                redo: () => ({
                    ...world,
                    shapes
                })
            })
            
            resetVisualMods()

            setMovingVertex(undefined)
        }

        const onMouseMoveRaw = (data: PIXI.InteractionData) => {
            let vertex = { x: data.global.x, y: data.global.y }
    
            if (data.originalEvent.shiftKey) {
                vertex = {
                    x: Math.round(vertex.x / snapDistance) * snapDistance,
                    y: Math.round(vertex.y / snapDistance) * snapDistance
                }
            }
    
            shape.vertices[vertexIndex] = vertex
    
            applyVisualMods({ 
                highlightVertices: [ { vertex, color: highlightMoveColor } ],
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
                const vertex = { x: app.renderer.plugins.interaction.mouse.global.x, y: app.renderer.plugins.interaction.mouse.global.y }
                shape.vertices[vertexIndex] = vertex

                applyVisualMods({
                    highlightVertices: [ { vertex, color: highlightMoveColor } ],
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

                applyVisualMods({
                    highlightVertices: [ { vertex: point, color: highlightMoveColor } ],
                    replaceShapeAt: { index: shapeIndex, shape }
                })
            }
        }

        onMouseMoveRaw(app.renderer.plugins.interaction.mouse)

        app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        app.renderer.plugins.interaction.on("mouseup", onMouseUp)
        app.renderer.plugins.interaction.on("mouseupoutside", onMouseUp)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("keydown", onKeyDown)

        return () => {
            app.renderer.plugins.interaction.off("mousemove", onMouseMove)
            app.renderer.plugins.interaction.off("mouseup", onMouseUp)
            app.renderer.plugins.interaction.off("mouseupoutside", onMouseUp)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("keydown", onKeyDown)
        }
    }

    const placeObjectEffect = (placeObject: PlacableObject) => {
        const onMouseMove = (e: PIXI.InteractionEvent) => {
            const position = { x: e.data.global.x, y: e.data.global.y }
    
            applyVisualMods({ 
                previewObject: {
                    src: placeObject.src,
                    position,
                    rotation: 0
                }
            })
        }

        app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        return () => {
            app.renderer.plugins.interaction.off("mousemove", onMouseMove)
        }
    }

    const defaultEffect = () => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Control") {
                onMouseMoveRaw(app.renderer.plugins.interaction.mouse.global.x, app.renderer.plugins.interaction.mouse.global.y, e.ctrlKey)
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key == "Control") {
                onMouseMoveRaw(app.renderer.plugins.interaction.mouse.global.x, app.renderer.plugins.interaction.mouse.global.y, e.ctrlKey)
            }
        }
        
        const onMouseMove = (e: PIXI.InteractionEvent) =>
            onMouseMoveRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.ctrlKey)

        const onMouseMoveRaw = (x: number, y: number, ctrl: boolean) => {
            const point = { x, y }
            const vertex = findClosestVertex(world.shapes, point, snapDistance)
    
            if (vertex) {
                const color = ctrl
                    ? highlightDeleteColor
                    : highlightColor

                applyVisualMods({ highlightVertices: [ { vertex: vertex.point, color } ]})
                return
            }
    
            const edge = findClosestEdge(world.shapes, point, snapDistance)
    
            if (edge) {
                applyVisualMods({ highlightVertices: [ { vertex: edge.point, color: highlightColor } ]})
                return
            }
    
            resetVisualMods()
        }

        const onMouseDown = (e: PIXI.InteractionEvent) => {
            const point = { x: e.data.global.x, y: e.data.global.y }
            const vertex = findClosestVertex(world.shapes, point, snapDistance)
            
            if (vertex) {
                if (e.data.originalEvent.ctrlKey) {
                    const newShapes = [...world.shapes]

                    if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                        newShapes.splice(vertex.shapeIndex, 1)
                    }
                    else {
                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                    }
                    
                    mutateWorld({
                        undo: previousWorld => ({
                            ...previousWorld,
                            shapes: [...world.shapes]
                        }),
                        redo: () => ({
                            ...world,
                            shapes: newShapes
                        })
                    })

                    return
                }
                else {
                    setMovingVertex({
                        vertexIndex: vertex.vertexIndex,
                        shapeIndex: vertex.shapeIndex,
                        shape: { vertices: [...world.shapes[vertex.shapeIndex].vertices] }
                    })

                    return
                }
            }

            const edge = findClosestEdge(world.shapes, point, snapDistance)

            if (edge) {
                // Need to copy the shape because we're going to mutate it. We need to make sure to not mutate the original shape.
                const shape = { vertices: [...world.shapes[edge.shapeIndex].vertices] }
                shape.vertices.splice(edge.edge[1], 0, edge.point)

                setMovingVertex({
                    vertexIndex: edge.edge[1],
                    shapeIndex: edge.shapeIndex,
                    shape: { vertices: shape.vertices }
                })

                return
            }

            mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...world.shapes]
                }),
                redo: () => ({
                    ...world,
                    shapes: [...world.shapes, { vertices: 
                        [
                            { x: point.x - 50, y: point.y - 50 },
                            { x: point.x + 50, y: point.y - 50 },
                            { x: point.x, y: point.y + 50 },
                        ] 
                    }]
                })
            })
        }

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        app.renderer.plugins.interaction.on("mousedown", onMouseDown)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            app.renderer.plugins.interaction.off("mousemove", onMouseMove)
            app.renderer.plugins.interaction.off("mousedown", onMouseDown)
        }
    }

    useEffect(() => {
        if (movingVertex) {
            return moveVertexEffect(movingVertex)
        }

        if (placeObject) {
            return placeObjectEffect(placeObject)
        }

        return defaultEffect()
    }, [ app.stage, movingVertex, placeObject, world ])

    return (
        <div className="flex p-4 flex-col items-center bg-base-100 rounded-lg h-full self-end">
            <PlaceableObjectSelect
                selected={placeObject}
                onSelect={setPlaceObject}
            />

            <div className="fixed bottom-0 left-0 p-4 pointer-events-none select-none">
                <div className="flex flex-col">
                    <div className="text-white opacity-50">
                        Hold <kbd>Ctrl</kbd> and click to delete a vertex
                    </div>
                    <div className="text-white opacity-50">
                        Hold <kbd>Shift</kbd> to snap to grid
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlacementMode

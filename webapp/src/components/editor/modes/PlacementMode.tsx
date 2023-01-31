import { AppProvider, useApp } from "@inlet/react-pixi"
import { useCallback, useEffect, useState } from "react"
import useEditorStore from "../EditorStore"
import { findClosestEdge, findClosestVertex, isPointInsideObject, PlacableObject, ObjectInWorld, Shape, Vertex, VertexIdentifier, PlaceableObjectType } from "../World"
import PIXI from "pixi.js"

import greenFlag from "../../../assets/flag-green.svg"
import redFlag from "../../../assets/flag-red.svg"
import rocket from "../../../assets/rocket.svg"
import { shallow } from "zustand/shallow"

const snapDistance = 20

const highlightColor = 0x33ff33
const highlightDeleteColor = 0xff2222
const highlightMoveColor = 0x00aaaa

export interface EditorMode {
    editorMenu: () => JSX.Element
    onClick: (x: number, y: number, ctrl: boolean, shift: boolean) => void
}

interface SinglePlaceableObjectProps {
    obj: PlacableObject
    selected: boolean
    onSelect: (obj: PlacableObject) => void
}

interface PlaceableObjectSelectProps {
    selected: PlacableObject | undefined
    onSelect: (obj: PlacableObject | undefined) => void
}

const SinglePlaceableObject = (props: SinglePlaceableObjectProps) => (
    <button
        onClick={() => props.onSelect(props.obj)} 
        className={`btn h-min ${props.selected ? "btn-active" : ""}`}>
        <div className="flex flex-col p-5 space-y-4 items-center">
            <img src={props.obj.src} className="pl-2 w-8" />
            <div>
                { props.obj.type.toString() }
            </div>
        </div>
    </button>
)

const placeableObjects = [
    { src: redFlag,   type: PlaceableObjectType.RedFlag,   anchor: { x: 0.0, y: 1 },   size: { width: 275 * 0.2, height: 436 * 0.2 } },
    { src: greenFlag, type: PlaceableObjectType.GreenFlag, anchor: { x: 0.0, y: 1 },   size: { width: 275 * 0.2, height: 436 * 0.2 } },
    { src: rocket,    type: PlaceableObjectType.Rocket,    anchor: { x: 0.5, y: 1 },   size: { width: 300 * 0.2, height: 600 * 0.2 } },
]

const PlaceableObjectSelect = (props: PlaceableObjectSelectProps) => {
    const onSelect = useCallback((obj: PlacableObject) => {
        if (props.selected?.src === obj.src) {
            props.onSelect(undefined)
        }
        else {
            props.onSelect(obj)
        }

    }, [ props.onSelect, props.selected ])

    return (
        <div className="btn-group btn-group-vertical">
            { placeableObjects.map(obj => (
                <SinglePlaceableObject
                    key={obj.type}
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

        const onMouseMoveRaw = (x: number, y: number, snap: boolean) => {
            let vertex = { x, y }
    
            if (snap) {
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
                onMouseMoveRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.shiftKey)
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
        
        onMouseMoveRaw(
            app.renderer.plugins.interaction.mouse.global.x, 
            app.renderer.plugins.interaction.mouse.global.y, 
            false)

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
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                resetVisualMods()
                setPlaceObject(undefined)
            }

            onMouseMoveRaw(
                app.renderer.plugins.interaction.mouse.global.x,
                app.renderer.plugins.interaction.mouse.global.y,
                e.shiftKey)
        }

        const onKeyUp = (e: KeyboardEvent) => {
            onMouseMoveRaw(
                app.renderer.plugins.interaction.mouse.global.x,
                app.renderer.plugins.interaction.mouse.global.y,
                e.shiftKey)
        }

        const onMouseMove = (e: PIXI.InteractionEvent) =>
            onMouseMoveRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.shiftKey)

        const findEdgeForObject = (position: Vertex, snap: Boolean) => {
            const edge = findClosestEdge(world.shapes, position, snapDistance)

            if (!edge) {
                return edge
            }

            // edge.point is the closest point on the edge
            // edge.edge contains the two indices of the edge's vertices

            const edgeStart = world.shapes[edge.shapeIndex].vertices[edge.edge[0]]
            const edgeEnd = world.shapes[edge.shapeIndex].vertices[edge.edge[1]]

            const rotation = Math.atan2(edgeEnd.y - edgeStart.y, edgeEnd.x - edgeStart.x)

            if (snap) {
                const edgeVector = { x: edgeEnd.x - edgeStart.x, y: edgeEnd.y - edgeStart.y }
                const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y)
                const edgeDirection = { x: edgeVector.x / edgeLength, y: edgeVector.y / edgeLength }

                const edgeStartToPosition = { x: position.x - edgeStart.x, y: position.y - edgeStart.y }
                const edgeStartToPositionLength = Math.sqrt(edgeStartToPosition.x * edgeStartToPosition.x + edgeStartToPosition.y * edgeStartToPosition.y)

                const snapDistanceFromEdgeStart = Math.round(edgeStartToPositionLength / snapDistance) * snapDistance
                const snappedPoint = {
                    x: edgeStart.x + edgeDirection.x * snapDistanceFromEdgeStart,
                    y: edgeStart.y + edgeDirection.y * snapDistanceFromEdgeStart
                }

                return {
                    point: snappedPoint,
                    rotation
                }
            }
            else {
                return {
                    point: edge.point,
                    rotation
                }
            }
        }

        const onMouseMoveRaw = (x: number, y: number, snap: boolean) => {
            const position = { x, y }

            const edge = findEdgeForObject(position, snap)

            if (edge) {
                applyVisualMods({
                    previewObject: {
                        src: placeObject.src,
                        position: edge.point,
                        rotation: edge.rotation,
                        anchor: placeObject.anchor
                    }
                })
            }
            else {
                if (snap) {
                    position.x = Math.round(position.x / snapDistance) * snapDistance
                    position.y = Math.round(position.y / snapDistance) * snapDistance
                }

                applyVisualMods({ 
                    previewObject: {
                        src: placeObject.src,
                        position,
                        rotation: 0,
                        anchor: { x: 0.5, y: 0.5 }
                    }
                })
            }
        }

        const onMouseDown = (e: PIXI.InteractionEvent) => {
            const position = { x: e.data.global.x, y: e.data.global.y }

            const edge = findEdgeForObject(position, e.data.originalEvent.shiftKey)

            if (edge) {
                mutateWorld({
                    undo: world => {
                        world.objects.pop()
                        return world
                    },
                    redo: world => {
                        world.objects.push({
                            placeable: placeObject,
                            position: edge.point,
                            rotation: edge.rotation,
                        })
                        return world
                    }
                })
                setPlaceObject(undefined)
            }
            else {
                // computed by placeObject.anchor and placeObject.size, position should be center of object
                position.x += placeObject.size.width * placeObject.anchor.x - placeObject.size.width * 0.5
                position.y += placeObject.size.height * placeObject.anchor.y - placeObject.size.height * 0.5

                if (e.data.originalEvent.shiftKey) {
                    position.x = Math.round(position.x / snapDistance) * snapDistance
                    position.y = Math.round(position.y / snapDistance) * snapDistance
                }

                mutateWorld({
                    undo: world => {
                        world.objects.pop()
                        return world
                    },
                    redo: world => {
                        world.objects.push({
                            placeable: placeObject,
                            position,
                            rotation: 0
                        })
                        return world
                    }
                })
                setPlaceObject(undefined)
            }
        }

        onMouseMoveRaw(
            app.renderer.plugins.interaction.mouse.global.x,
            app.renderer.plugins.interaction.mouse.global.y,
            false)

        app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        app.renderer.plugins.interaction.on("mousedown", onMouseDown)
        
        return () => {
            app.renderer.plugins.interaction.off("mousemove", onMouseMove)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            app.renderer.plugins.interaction.off("mousedown", onMouseDown)
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

            for (let i = world.objects.length - 1; i >= 0; i--) {
                const object = world.objects[i]
                
                if (isPointInsideObject(point, object)) {
                    applyVisualMods({ 
                        highlightObjects: [ { index: i, color: highlightColor } ]
                    })

                    return
                }
            }

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

            for (let i = world.objects.length - 1; i >= 0; i--) {
                const object = world.objects[i]
                
                if (isPointInsideObject(point, object)) {
                    mutateWorld({
                        undo: world => ({
                            ...world,
                            objects: [...world.objects, object] 
                        }),
                        redo: world => ({
                            ...world,
                            objects: world.objects.filter((_, index) => index != i)
                        })
                    })

                    setPlaceObject(object.placeable)

                    return
                }
            }

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

        onMouseMoveRaw(
            app.renderer.plugins.interaction.mouse.global.x, 
            app.renderer.plugins.interaction.mouse.global.y, 
            false)

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
                <div className="flex flex-col text-white opacity-50">
                    {
                        placeObject && (
                            <div>
                                Press <kbd>Esc</kbd> to cancel placing
                            </div>
                        )
                    }
                    {
                        (!movingVertex && !placeObject) && (
                            <div>
                                Hold <kbd>Ctrl</kbd> and click to delete a vertex
                            </div>
                        )
                    }
                    {
                        (movingVertex || placeObject) && (
                            <div>
                                Hold <kbd>Shift</kbd> to snap to grid
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default PlacementMode

export {}
/*
import { useEffect } from "react"
import { DefaultHandlerProps, PlacementHandlerType } from "./PlacementHandlerProps"
import useEditorStore from "../../../EditorStore"
import { shallow } from "zustand/shallow"
import { findClosestEdge, findClosestVertex, isPointInsideObject } from "../../../World"
import { highlightColor, highlightDeleteColor, highlightObjectColor, snapDistance } from "../PlacementModeSettings"
import { EditorShape } from "../../../EditorWorld"


const DefaultHandler = (props: DefaultHandlerProps) => {
    const state = useEditorStore(state => ({
        world: state.world,
        mutateWorld: state.mutateWorld,
        resetVisualMods: state.resetVisualMods,
        applyVisualMods: state.applyVisualMods
    }), shallow)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key == "Control") {
                onMouseMoveRaw(props.app.renderer.plugins.interaction.mouse.global.x, props.app.renderer.plugins.interaction.mouse.global.y, e.ctrlKey)
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key == "Control") {
                onMouseMoveRaw(props.app.renderer.plugins.interaction.mouse.global.x, props.app.renderer.plugins.interaction.mouse.global.y, e.ctrlKey)
            }
        }
        
        const onMouseMoveRaw = (x: number, y: number, ctrl: boolean) => {
            const point = { x, y }

            for (let i = state.world.objects.length - 1; i >= 0; i--) {
                const object = state.world.objects[i]
                
                if (isPointInsideObject(point, object)) {
                    if (ctrl) {
                        state.applyVisualMods({ 
                            highlightObjects: [ { index: i, color: highlightDeleteColor } ]
                        })
                    }
                    else {
                        state.applyVisualMods({ 
                            highlightObjects: [ { index: i, color: highlightObjectColor } ]
                        })
                    }

                    return
                }
            }

            const vertex = findClosestVertex(state.world.shapes, point, snapDistance)
    
            if (vertex) {
                const color = ctrl
                    ? highlightDeleteColor
                    : highlightColor

                    state.applyVisualMods({ highlightVertices: [ { vertex: vertex.point, color } ]})
                return
            }
    
            const edge = findClosestEdge(state.world.shapes, point, snapDistance)
    
            if (edge) {
                state.applyVisualMods({ highlightVertices: [ { vertex: edge.point, color: highlightColor } ]})
                return
            }
    
            // state.resetVisualMods()
        }

        const onMouseDownRaw = (x: number, y: number, ctrl: boolean) => {
            console.log("Mouse down")
            const point = { x, y }

            for (let i = state.world.objects.length - 1; i >= 0; i--) {
                const object = state.world.objects[i]
                
                if (isPointInsideObject(point, object)) {
                    state.mutateWorld({
                        undo: world => ({
                            ...world,
                            objects: [...world.objects, object] 
                        }),
                        redo: world => ({
                            ...world,
                            objects: world.objects.filter((_, index) => index != i)
                        })
                    })

                    if (!ctrl) {
                        props.setHandler({
                            ...props,
                            type: PlacementHandlerType.PlaceObject,
                            obj: object.placeable
                        })
                    }

                    return
                }
            }

            const vertex = findClosestVertex(state.world.shapes, point, snapDistance)
            
            if (vertex) {
                if (ctrl) {
                    const newShapes = [...state.world.shapes]

                    if (newShapes[vertex.shapeIndex].vertices.length <= 3) {
                        newShapes.splice(vertex.shapeIndex, 1)
                    }
                    else {
                        newShapes[vertex.shapeIndex].vertices.splice(vertex.vertexIndex, 1)
                    }
                    
                    state.mutateWorld({
                        undo: previousWorld => ({
                            ...previousWorld,
                            shapes: [...state.world.shapes]
                        }),
                        redo: () => ({
                            ...state.world,
                            shapes: newShapes
                        })
                    })

                    return
                }
                else {
                    props.setHandler({
                        ...props,
                        type: PlacementHandlerType.MoveVertex,
                        shape: { vertices: [...state.world.shapes[vertex.shapeIndex].vertices] },
                        shapeIndex: vertex.shapeIndex,
                        vertexIndex: vertex.vertexIndex
                    })

                    return
                }
            }

            const edge = findClosestEdge(state.world.shapes, point, snapDistance)

            if (edge) {
                // Need to copy the shape because we're going to mutate it. We need to make sure to not mutate the original shape.
                const shape = { vertices: [...state.world.shapes[edge.shapeIndex].vertices] }
                shape.vertices.splice(edge.edge[1], 0, edge.point)

                props.setHandler({
                    ...props,
                    type: PlacementHandlerType.MoveVertex,
                    shape: { vertices: shape.vertices },
                    shapeIndex: edge.shapeIndex,
                    vertexIndex: edge.edge[1]
                })

                return
            }
            state.mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...state.world.shapes]
                }),
                redo: () => ({
                    ...state.world,
                    shapes: [...state.world.shapes, { vertices: 
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
            props.app.renderer.plugins.interaction.mouse.global.x, 
            props.app.renderer.plugins.interaction.mouse.global.y, 
            false)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        const onMouseMoveJS = (e: MouseEvent) => onMouseMoveRaw(e.clientX, e.clientY, e.ctrlKey)
        const onMouseDownJS = (e: MouseEvent) => {
            onMouseDownRaw(e.clientX, e.clientY, e.ctrlKey)
        }

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
        }
    }, [ state, props ])

    return (
        <div>
            Hold <kbd>Ctrl</kbd> and click to delete a vertex or object
        </div>
    )
}

export default DefaultHandler
*/
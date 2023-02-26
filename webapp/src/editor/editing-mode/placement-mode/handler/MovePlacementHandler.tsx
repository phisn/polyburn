import { AppProvider, useApp } from "@inlet/react-pixi"
import { useCallback, useEffect, useState } from "react"
import PIXI from "pixi.js"

import greenFlag from "../../assets/flag-green.svg"
import redFlag from "../../assets/flag-red.svg"
import rocket from "../../assets/rocket.svg"
import { shallow } from "zustand/shallow"
import { MoveVertexHandlerProps, PlacementHandlerType } from "./PlacementHandlerProps"
import { highlightMoveColor, snapDistance } from "../PlacementModeSettings"
import useEditorStore from "../../../EditorStore"

function MoveVertexHandler(props: MoveVertexHandlerProps) {
    const state = useEditorStore(state => ({
        world: state.world,
        mutateWorld: state.mutateWorld,
        resetVisualMods: state.resetVisualMods,
        applyVisualMods: state.applyVisualMods
    }), shallow)

    useEffect(() => {
        const onMouseUp = (e: PIXI.InteractionEvent) => {
            onMouseUpRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.ctrlKey)
        }

        const onMouseUpRaw = (x: number, y: number, ctrl: boolean) => {
            let vertex = { x, y }
    
            if (ctrl) {
                vertex = {
                    x: Math.round(vertex.x / snapDistance) * snapDistance,
                    y: Math.round(vertex.y / snapDistance) * snapDistance
                }
                console.log(`actually snapped to ${vertex.x}, ${vertex.y}`)
            }
    
            // Workaround. Somehow the vertex is not updated in the world, so we have to do it manually
            let newShape = { vertices: [...props.shape.vertices] }
            newShape.vertices[props.vertexIndex] = vertex
    
            const shapes = [...state.world.shapes]
            shapes[props.shapeIndex] = newShape
    
            state.mutateWorld({
                undo: previousWorld => ({
                    ...previousWorld,
                    shapes: [...state.world.shapes]
                }),
                redo: () => {
                    console.log(`redoing move vertex ${props.vertexIndex} in shape ${props.shapeIndex} to ${vertex.x}, ${vertex.y}`)
                    return ({
                        ...state.world,
                        shapes
                    })
                }
            })
    
            state.resetVisualMods()

            props.setHandler({ 
                ...props,
                type: PlacementHandlerType.Default
            })
        }
    
        const onMouseMoveRaw = (x: number, y: number, snap: boolean) => {
            let vertex = { x, y }
    
            if (snap) {
                vertex = {
                    x: Math.round(vertex.x / snapDistance) * snapDistance,
                    y: Math.round(vertex.y / snapDistance) * snapDistance
                }
                console.log(`snapped to ${vertex.x}, ${vertex.y}`)
            }
    
            props.shape.vertices[props.vertexIndex] = vertex
    
            state.applyVisualMods({
                highlightVertices: [{ vertex, color: highlightMoveColor }],
                replaceShapeAt: { index: props.shapeIndex, shape: props.shape }
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
                const vertex = { 
                    x: props.app.renderer.plugins.interaction.mouse.global.x,
                    y: props.app.renderer.plugins.interaction.mouse.global.y 
                }

                props.shape.vertices[props.vertexIndex] = vertex
    
                state.applyVisualMods({
                    highlightVertices: [{ vertex, color: highlightMoveColor }],
                    replaceShapeAt: { index: props.shapeIndex, shape: props.shape }
                })
            }
        }
    
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                const point = {
                    x: Math.round(props.app.renderer.plugins.interaction.mouse.global.x / snapDistance) * snapDistance,
                    y: Math.round(props.app.renderer.plugins.interaction.mouse.global.y / snapDistance) * snapDistance
                }
                props.shape.vertices[props.vertexIndex] = point
    
                state.applyVisualMods({
                    highlightVertices: [{ vertex: point, color: highlightMoveColor }],
                    replaceShapeAt: { index: props.shapeIndex, shape: props.shape }
                })
            }
        }
    
        onMouseMoveRaw(
            props.app.renderer.plugins.interaction.mouse.global.x,
            props.app.renderer.plugins.interaction.mouse.global.y,
            false)
    
        props.app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        props.app.renderer.plugins.interaction.on("mouseup", onMouseUp)
        window.addEventListener("keyup", onKeyUp)
        window.addEventListener("keydown", onKeyDown)

        const onMouseMoveJS = (e: MouseEvent) => onMouseMoveRaw(e.clientX, e.clientY, e.ctrlKey)
        const onMouseUpJS = (e: MouseEvent) => onMouseUpRaw(e.clientX, e.clientY, e.ctrlKey)

        document.getElementById("canvas")?.addEventListener("mousemove", onMouseMoveJS)
        document.addEventListener("mouseup", onMouseUpJS)
    
        return () => {
            props.app.renderer.plugins.interaction.off("mousemove", onMouseMove)
            props.app.renderer.plugins.interaction.off("mouseup", onMouseUp)
            props.app.renderer.plugins.interaction.off("mouseupoutside", onMouseUp)
            window.removeEventListener("keyup", onKeyUp)
            window.removeEventListener("keydown", onKeyDown)

            document.getElementById("canvas")?.removeEventListener("mousemove", onMouseMoveJS)
            document.removeEventListener("mouseup", onMouseUpJS)
        }
    }, [ state.world, props ])

    return (
        <>
            <div>
                Press <kbd>Esc</kbd> to cancel placing
            </div>
            <div>
                Hold <kbd>Shift</kbd> to snap to grid
            </div>
        </>
    )
}

export default MoveVertexHandler

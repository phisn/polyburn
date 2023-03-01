export {}
/*
import { useEffect } from "react";
import useEditorStore from "../../../EditorStore";
import { PlacementHandlerType, PlaceObjectHandlerProps } from "./PlacementHandlerProps";
import { findClosestEdge, Vertex } from "../../../World";
import { snapDistance } from "../PlacementModeSettings";
import { shallow } from "zustand/shallow";

function PlaceObjectHandler(props: PlaceObjectHandlerProps) {
    const store = useEditorEditorStore(state => ({
        renderer: state.rendering.renderer,
        world: state.world,
        mutate: state.mutate,
    }), shallow)

    const state = useEditorStore(state => ({
        world: state.world,
        mutateWorld: state.mutateWorld,
        resetVisualMods: state.resetVisualMods,
        applyVisualMods: state.applyVisualMods
    }), shallow)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                state.resetVisualMods()

                props.setHandler({
                    ...props,
                    type: PlacementHandlerType.Default
                })
            }

            onMouseMoveRaw(
                props.app.renderer.plugins.interaction.mouse.global.x,
                props.app.renderer.plugins.interaction.mouse.global.y,
                e.shiftKey)
        }

        const onKeyUp = (e: KeyboardEvent) => {
            onMouseMoveRaw(
                props.app.renderer.plugins.interaction.mouse.global.x,
                props.app.renderer.plugins.interaction.mouse.global.y,
                e.shiftKey)
        }

        const onMouseMove = (e: PIXI.InteractionEvent) =>
            onMouseMoveRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.shiftKey)

        const findEdgeForObject = (position: Vertex, snap: Boolean) => {
            const edge = findClosestEdge(state.world.shapes, position, snapDistance)

            if (!edge) {
                return edge
            }

            // edge.point is the closest point on the edge
            // edge.edge contains the two indices of the edge's vertices

            const edgeStart = state.world.shapes[edge.shapeIndex].vertices[edge.edge[0]]
            const edgeEnd = state.world.shapes[edge.shapeIndex].vertices[edge.edge[1]]

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
                state.applyVisualMods({
                    previewObject: {
                        placeable: props.obj,
                        position: edge.point,
                        rotation: edge.rotation,
                    }
                })
            }
            else {
                if (snap) {
                    position.x = Math.round(position.x / snapDistance) * snapDistance
                    position.y = Math.round(position.y / snapDistance) * snapDistance
                }

                state.applyVisualMods({ 
                    previewObject: {
                        placeable: props.obj,
                        position,
                        rotation: 0,
                        customAnchor: { x: 0.5, y: 0.5 }
                    }
                })
            }
        }

        const onMouseDown = (e: PIXI.InteractionEvent) => {
            onMouseDownRaw(e.data.global.x, e.data.global.y, e.data.originalEvent.ctrlKey)
        }

        const onMouseDownRaw = (x: number, y: number, ctrl: boolean) => {
            const position = { x, y }

            const edge = findEdgeForObject(position, ctrl)

            if (edge) {
                state.mutateWorld({
                    undo: world => {
                        world.objects.pop()
                        return world
                    },
                    redo: world => {
                        world.objects.push({
                            placeable: props.obj,
                            position: edge.point,
                            rotation: edge.rotation,
                        })
                        return world
                    }
                })

                props.setHandler({
                    ...props,
                    type: PlacementHandlerType.Default
                })
            }
            else {
                // computed by placeObject.anchor and placeObject.size, position should be center of object
                position.x += props.obj.scale * props.obj.size.width * props.obj.anchor.x - props.obj.scale * props.obj.size.width * 0.5
                position.y += props.obj.scale * props.obj.size.height * props.obj.anchor.y - props.obj.scale * props.obj.size.height * 0.5

                if (ctrl) {
                    position.x = Math.round(position.x / snapDistance) * snapDistance
                    position.y = Math.round(position.y / snapDistance) * snapDistance
                }

                state.mutateWorld({
                    undo: world => {
                        world.objects.pop()
                        return world
                    },
                    redo: world => {
                        world.objects.push({
                            placeable: props.obj,
                            position,
                            rotation: 0
                        })
                        return world
                    }
                })

                props.setHandler({
                    ...props,
                    type: PlacementHandlerType.Default
                })
            }
        }

        onMouseMoveRaw(
            props.app.renderer.plugins.interaction.mouse.global.x,
            props.app.renderer.plugins.interaction.mouse.global.y,
            false)

        props.app.renderer.plugins.interaction.on("mousemove", onMouseMove)
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)
        props.app.renderer.plugins.interaction.on("mousedown", onMouseDown)

        const onMouseMoveJS = (e: MouseEvent) => onMouseMoveRaw(e.clientX, e.clientY, e.ctrlKey)
        const onMouseDownJS = (e: MouseEvent) => onMouseDownRaw(e.clientX, e.clientY, e.ctrlKey)

        store.renderer.domElement.addEventListener("mousemove", onMouseMoveJS)
        store.renderer.domElement.addEventListener("mousedown", onMouseDownJS)
        
        return () => {
            props.app.renderer.plugins.interaction.off("mousemove", onMouseMove)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)
            props.app.renderer.plugins.interaction.off("mousedown", onMouseDown)

            store.renderer.domElement.removeEventListener("mousemove", onMouseMoveJS)
            store.renderer.domElement.removeEventListener("mousedown", onMouseDownJS)
        }
    },  [ state.world, props ])

    return (
        <>
            <div>
                Hold <kbd>Shift</kbd> to snap to grid
            </div>
        </>
    )
}

export default PlaceObjectHandler
*/
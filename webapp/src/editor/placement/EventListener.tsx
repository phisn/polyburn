import { useThree } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { buildCanvasToWorld } from "../Editor"
import { useEditorStore } from "../editor-store/useEditorStore"
import { snapDistance } from "../Values"
import { findClosestEdge, findClosestVertex } from "../world/Shape"
import { insertShape, insertVertex, moveVertex } from "../world/World"
import { ActionType } from "./state/Action"
import { HintType } from "./state/Hint"

function EventListener() {
    const canvas = useThree(state => state.gl.domElement)
    const camera = useThree(state => state.camera)
    const raycaster = useThree(state => state.raycaster)
    const scene = useThree(state => state.scene)

    const mutate = useEditorStore(state => state.mutate)
    const setModeState = useEditorStore(state => state.setModeState)

    const canvasToWorld = useMemo(() => buildCanvasToWorld(camera, canvas), [camera, canvas])
    
    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            const point = canvasToWorld(e.clientX, e.clientY)
            const world = useEditorStore.getState().world
            const action = useEditorStore.getState().modeState.action

            switch (action?.type) {
                case ActionType.MoveVertex:
                    console.log(`Calling moveVertex`)
                    setModeState({
                        hint: null,
                        action: {
                            ...action,
                            point
                        }
                    })

                    break
                default:
                    /*
                    for (let i = world.entities.length - 1; i >= 0; i--) {
                        const object = world.objects[i]
                        
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
                    */
                
                    const vertex = findClosestVertex(world.shapes, point, snapDistance)
                
                    if (vertex) {
                        setModeState({
                            hint: {
                                type: HintType.Vertex,
                                point: vertex.point,
                                delete: e.ctrlKey,

                                shapeIndex: vertex.shapeIndex,
                                vertexIndex: vertex.vertexIndex,
                            }
                        })
                
                        return
                    }
                
                    const edge = findClosestEdge(world.shapes, point, snapDistance)
                
                    if (edge) {
                        setModeState({
                            hint: {
                                type: HintType.Edge,
                                point: edge.point,

                                shapeIndex: edge.shapeIndex,
                                edge: edge.edge
                            }
                        })
                
                        return
                    }

                    setModeState({
                        hint: {
                            type: HintType.Space,
                        }
                    })

                    break
            }
        }

        const onPointerDown = (e: PointerEvent) => {
            if (e.button !== 0) {
                return
            }

            const point = canvasToWorld(e.clientX, e.clientY)
            const hint = useEditorStore.getState().modeState.hint

            switch (hint?.type) {
                case HintType.Space:
                    if (raycaster.intersectObjects(scene.children).length === 0) {
                        mutate(insertShape({
                            vertices: [
                                { x: point.x - 50, y: point.y + 50 },
                                { x: point.x + 50, y: point.y + 50 },
                                { x: point.x, y: point.y - 50 },
                            ]
                        }))
                    }
                    break

                case HintType.Edge:
                    mutate(insertVertex(
                        hint.shapeIndex,
                        hint.edge[0],
                        point
                    ))

                    setModeState({
                        action: {
                            type: ActionType.MoveVertex,

                            shapeIndex: hint.shapeIndex,
                            vertexIndex: hint.edge[0] + 1,

                            point: hint.point,
                        }
                    })

                    break

                case HintType.Vertex:
                    setModeState({
                        action: {
                            type: ActionType.MoveVertex,

                            shapeIndex: hint.shapeIndex,
                            vertexIndex: hint.vertexIndex,

                            point: hint.point,
                        }
                    })

                    break
            }

            onPointerMove(e)
        }

        const onPointerUp = (e: PointerEvent) => {
            const action = useEditorStore.getState().modeState.action

            switch (action?.type) {
                case ActionType.MoveVertex:
                    mutate(moveVertex(
                        action.shapeIndex,
                        action.vertexIndex,
                        action.point
                    ))

                    setModeState({
                        action: undefined
                    })

                    break
            }

            onPointerMove(e)
        }

        canvas.addEventListener("pointermove", onPointerMove)
        canvas.addEventListener("pointerdown", onPointerDown)
        canvas.addEventListener("pointerup", onPointerUp)

        return () => {
            canvas.removeEventListener("pointermove", onPointerMove)
            canvas.removeEventListener("pointerdown", onPointerDown)
            canvas.removeEventListener("pointerup", onPointerUp)
        }
    })

    return (
        <>
        </>
    )
}

export default EventListener

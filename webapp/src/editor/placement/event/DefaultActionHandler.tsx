import { useEditorStore } from "../../editor-store/useEditorStore"
import { snapDistance } from "../../Values"
import { Point } from "../../world/Point"
import { findClosestEdge, findClosestVertex } from "../../world/Shape"
import { insertShape } from "../../world/World"
import { ActionType } from "../state/Action"
import { HintType } from "../state/Hint"
import { isInsideCanvas, isLeftButton, PointerHandlerParams } from "./EventListener"

export function defaultActionHandler(params: PointerHandlerParams) {
    updateHint(params.point, params.event.ctrlKey)

    if (isLeftButton(params.event) && isInsideCanvas(params.event, params.canvas)) {
        const state = useEditorStore.getState()

        switch (state.modeState.hint?.type) {
            case HintType.Space:
                if (params.raycaster.intersectObjects(params.scene.children).length === 0) {
                    state.mutate(insertShape({
                        vertices: [
                            { x: params.point.x - 50, y: params.point.y + 50 },
                            { x: params.point.x + 50, y: params.point.y + 50 },
                            { x: params.point.x, y: params.point.y - 50 },
                        ]
                    }))
                }

                break
            case HintType.Edge:
                state.setModeState({
                    action: {
                        type: ActionType.InsertVertex,

                        shapeIndex: state.modeState.hint.shapeIndex,
                        vertexAfterIndex: state.modeState.hint.edge[0],

                        point: params.point
                    },
                    hint: null
                })

                break
            case HintType.Vertex:
                state.setModeState({
                    action: {
                        type: ActionType.MoveVertex,

                        shapeIndex: state.modeState.hint.shapeIndex,
                        vertexIndex: state.modeState.hint.vertexIndex,

                        point: params.point
                    },
                    hint: null
                })

                break
        }
    }
}

const updateHint = (point: Point, ctrl: boolean) => {
    const state = useEditorStore.getState()

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

    const vertex = findClosestVertex(state.world.shapes, point, snapDistance)

    if (vertex) {
        state.setModeState({
            hint: {
                type: HintType.Vertex,
                point: vertex.point,
                delete: ctrl,

                shapeIndex: vertex.shapeIndex,
                vertexIndex: vertex.vertexIndex,
            }
        })

        return
    }

    const edge = findClosestEdge(state.world.shapes, point, snapDistance)

    if (edge) {
        state.setModeState({
            hint: {
                type: HintType.Edge,
                point: edge.point,

                shapeIndex: edge.shapeIndex,
                edge: edge.edge
            }
        })

        return
    }

    state.setModeState({
        hint: {
            type: HintType.Space,
        }
    })
}
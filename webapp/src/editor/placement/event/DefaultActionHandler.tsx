import { isPointInsideEntity } from "../../../model/world/Entities"
import { Point } from "../../../model/world/Point"
import { findClosestEdge, findClosestVertex } from "../../../model/world/Shape"
import { insertShape, removeEntity, removeVertex } from "../../editor-store/MutationsForWorld"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { snapDistance } from "../../Values"
import { ActionType } from "../state/Action"
import { HintType } from "../state/Hint"
import { isInsideCanvas, PointerHandlerParams } from "./Definitions"

export function defaultActionHandler(params: PointerHandlerParams) {
    updateHint(params.point, params.event.delete)

    if (params.event.leftButton && !params.previousEvent?.leftButton && 
        isInsideCanvas(params.event, params.canvas)) {
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
            if (params.event.delete) {
                state.mutate(
                    removeVertex(state.modeState.hint.shapeIndex, state.modeState.hint.vertexIndex)
                )

                break
            }

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
        case HintType.Entity:
            if (params.event.delete) {
                state.mutate(
                    removeEntity(state.modeState.hint.entityIndex)
                )

                break
            }

            state.setModeState({
                action: {
                    type: ActionType.PlaceEntity,
                    entity: state.world.entities[state.modeState.hint.entityIndex]
                },
                hint: null
            })

            state.mutate(
                removeEntity(state.modeState.hint.entityIndex)
            )

            break
        }
    }
}

const updateHint = (point: Point, delete_: boolean) => {
    const state = useEditorStore.getState()

    for (let i = state.world.entities.length - 1; i >= 0; i--) {
        const entity = state.world.entities[i]

        if (isPointInsideEntity(point, entity)) {
            state.setModeState({
                hint: {
                    type: HintType.Entity,
                    entityIndex: i,
                    delete: delete_,
                }
            })

            return
        }
    }

    const vertex = findClosestVertex(state.world.shapes, point, snapDistance)

    if (vertex) {
        state.setModeState({
            hint: {
                type: HintType.Vertex,
                point: vertex.point,
                delete: delete_,

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
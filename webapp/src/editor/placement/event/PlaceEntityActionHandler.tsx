import { snapDistance } from "../../../common/Values"
import { entities } from "../../../model/world/Entities"
import { Point } from "../../../model/world/Point"
import { findClosestEdge } from "../../../model/world/Shape"
import { scale } from "../../../model/world/Size"
import { changeAnchor } from "../../../utility/math"
import { EditorStore } from "../../editor-store/EditorStore"
import { insertEntity } from "../../editor-store/MutationsForWorld"
import { useEditorStore } from "../../editor-store/useEditorStore"
import { PointerHandlerParams } from "../../event/EventDefinitions"
import { PlaceEntityAction } from "../state/Action"

export function placeEntityActionHandler(params: PointerHandlerParams<PlaceEntityAction>) {
    const state = useEditorStore.getState()

    if (params.event.leftButton && !params.previousEvent?.leftButton) {
        state.setModeState({
            action: null
        })

        const entry = entities[params.action.entity.type]
        
        state.mutate(insertEntity(
            entry.transformOrCreate(
                params.action.entity.position,
                params.action.entity.rotation,
                params.action.entity.buffered
            )
        ))
    }
    else {
        /*
        state.setModeState({
            action: {
                ...params.action,
                entity: {
                    ...params.action.entity,
                    position: params.point
                }
            }
        })
        */

        const edge = findEdgeForObject(state, params.point, params.event.snap)
        const entry = entities[params.action.entity.type]

        if (edge) {
            const transposed = changeAnchor(
                edge.point,
                edge.rotation,
                scale(entry.size, entry.scale),
                { x: 0.5, y: 0 },
                entry.anchor
            )

            state.setModeState({
                action: {
                    ...params.action,
                    entity: {
                        ...params.action.entity,
                        position: transposed,
                        rotation: edge.rotation
                    }
                }
            })
            /*
            state.applyVisualMods({
                previewObject: {
                    placeable: props.obj,
                    position: edge.point,
                    rotation: edge.rotation,
                }
            })
            */
        }
        else {
            const rounded: Point = params.event.snap
                ? {
                    x: Math.round(params.point.x / snapDistance) * snapDistance,
                    y: Math.round(params.point.y / snapDistance) * snapDistance
                }
                : params.point

            const transposed = changeAnchor(
                rounded,
                0,
                scale(entry.size, entry.scale),
                { x: 0.5, y: 0.5 },
                entry.anchor,
            )
            
            state.setModeState({
                action: {
                    ...params.action,
                    entity: {
                        ...params.action.entity,
                        position: transposed,
                        rotation: 0
                    }
                }
            })

            /*
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
            */
        }
    }
}

const findEdgeForObject = (state: EditorStore, position: Point, snap: boolean) => {
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


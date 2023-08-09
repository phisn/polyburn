import { EntityType } from "runtime/src/core/common/EntityType"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { Point } from "runtime/src/model/world/Point"
import { snapDistance } from "../../../common/Values"
import { EditorEvent } from "../EventHandler"
import { ShapeState, findClosestEdge } from "../entities/shape/ShapeState"
import { WorldState } from "./WorldState"

export const findLocationForEntity = (world: WorldState, event: EditorEvent, type: EntityType) => {
    const graphicEntry = entityModelRegistry[type]
    const edge = findEdgeForEntity(world, event.position, true)

    if (edge) {
        const transposed = changeAnchor(
            edge.point,
            edge.rotation,
            graphicEntry,
            { x: 1, y: 0 },
            { x: 0.5, y: 1 },
        )

        return [transposed.x, transposed.y, edge.rotation] as const
    }

    const transposed = changeAnchor(
        event.positionInGrid,
        0,
        graphicEntry,
        { x: 1, y: 0 },
        { x: 0.5, y: 0.5 },
    )

    return [transposed.x, transposed.y, 0] as const
}

export const findEdgeForEntity = (world: WorldState, position: Point, snap: boolean) => {
    const shapes = [...world.entities.values()].filter(
        (entity): entity is ShapeState => entity.type === EntityType.Shape,
        position,
    )

    const edge = findClosestEdge(shapes, position, snapDistance)

    if (!edge) {
        return edge
    }

    // edge.point is the closest point on the edge
    // edge.edge contains the two indices of the edge's vertices

    const edgeStart = shapes[edge.shapeIndex].vertices[edge.edge[0]]
    const edgeEnd = shapes[edge.shapeIndex].vertices[edge.edge[1]]

    const rotation =
        Math.atan2(
            edgeEnd.position.y - edgeStart.position.y,
            edgeEnd.position.x - edgeStart.position.x,
        ) + Math.PI

    if (snap) {
        const edgeVector = {
            x: edgeEnd.position.x - edgeStart.position.x,
            y: edgeEnd.position.y - edgeStart.position.y,
        }

        const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y)
        const edgeDirection = { x: edgeVector.x / edgeLength, y: edgeVector.y / edgeLength }

        const edgeStartToPosition = {
            x: position.x - edgeStart.position.x,
            y: position.y - edgeStart.position.y,
        }

        const edgeStartToPositionLength = Math.sqrt(
            edgeStartToPosition.x * edgeStartToPosition.x +
                edgeStartToPosition.y * edgeStartToPosition.y,
        )

        const snapDistanceFromEdgeStart =
            Math.round(edgeStartToPositionLength / snapDistance) * snapDistance

        const snappedPoint = {
            x: edgeStart.position.x + edgeDirection.x * snapDistanceFromEdgeStart,
            y: edgeStart.position.y + edgeDirection.y * snapDistanceFromEdgeStart,
        }

        return {
            point: snappedPoint,
            rotation,
        }
    } else {
        return {
            point: edge.point,
            rotation,
        }
    }
}

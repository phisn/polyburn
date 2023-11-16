import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/Point"
import { changeAnchor } from "runtime/src/model/world/change-anchor"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import { snapDistance } from "../../../common/constants"
import { EditorEvent } from "../EventHandler"
import { ShapeState, findClosestEdge } from "../entities/shape/shape-state"
import { WorldState } from "./world-state"

export const findLocationForEntity = (world: WorldState, event: EditorEvent, type: EntityType) => {
    const graphicEntry = entityRegistry[type]
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
        (entity): entity is ShapeState => entity.type === EntityType.SHAPE,
        position,
    )

    const edge = findClosestEdge(shapes, position, snapDistance)

    if (!edge) {
        return edge
    }

    const shape = shapes[edge.shapeIndex]

    // edge.point is the closest point on the edge
    // edge.edge contains the two indices of the edge's vertices

    const edgeStart = {
        x: shapes[edge.shapeIndex].vertices[edge.edge[0]].position.x + shape.position.x,
        y: shapes[edge.shapeIndex].vertices[edge.edge[0]].position.y + shape.position.y,
    }

    const edgeEnd = {
        x: shapes[edge.shapeIndex].vertices[edge.edge[1]].position.x + shape.position.x,
        y: shapes[edge.shapeIndex].vertices[edge.edge[1]].position.y + shape.position.y,
    }

    const rotation = Math.atan2(edgeEnd.y - edgeStart.y, edgeEnd.x - edgeStart.x) + Math.PI

    if (snap) {
        const edgeVector = {
            x: edgeEnd.x - edgeStart.x,
            y: edgeEnd.y - edgeStart.y,
        }

        const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y)
        const edgeDirection = { x: edgeVector.x / edgeLength, y: edgeVector.y / edgeLength }

        const edgeStartToPosition = {
            x: position.x - edgeStart.x,
            y: position.y - edgeStart.y,
        }

        const edgeStartToPositionLength = Math.sqrt(
            edgeStartToPosition.x * edgeStartToPosition.x +
                edgeStartToPosition.y * edgeStartToPosition.y,
        )

        const snapDistanceFromEdgeStart =
            Math.round(edgeStartToPositionLength / snapDistance) * snapDistance

        const snappedPoint = {
            x: edgeStart.x + edgeDirection.x * snapDistanceFromEdgeStart,
            y: edgeStart.y + edgeDirection.y * snapDistanceFromEdgeStart,
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

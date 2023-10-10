import { Point } from "runtime/src/model/Point"
import { changeAnchor } from "runtime/src/model/world/change-anchor"
import { snapDistance } from "../../../../../common/constants"
import { EditorEvent } from "../../../EventHandler"
import { findClosestEdge } from "../shape/find-closest-edge"
import { ShapeEntity } from "../shape/shape"
import { ObjectEntity } from "./object"

export const findLocationForObject = (
    event: EditorEvent,
    targetEntity: ObjectEntity,
    shapeEntities: ShapeEntity[],
) => {
    const edge = findEdgeForEntity(event.position, true, shapeEntities)

    if (edge) {
        const transposed = changeAnchor(
            edge.point,
            edge.rotation,
            targetEntity.components.object.size(),
            { x: 1, y: 0 },
            { x: 0.5, y: 1 },
        )

        return {
            position: transposed,
            rotation: edge.rotation,
        }
    }

    const transposed = changeAnchor(
        event.positionInGrid,
        0,
        targetEntity.components.object.size(),
        { x: 1, y: 0 },
        { x: 0.5, y: 0.5 },
    )

    return {
        position: transposed,
        rotation: 0,
    }
}

export const findEdgeForEntity = (position: Point, snap: boolean, shapes: ShapeEntity[]) => {
    const edge = findClosestEdge(shapes, position, snapDistance)

    if (!edge) {
        return edge
    }

    const shape = shapes[edge.shapeIndex].components.shape
    const shapeObject = shapes[edge.shapeIndex].components.object

    // edge.point is the closest point on the edge
    // edge.edge contains the two indices of the edge's vertices

    const edgeStart = {
        x: shape.vertices[edge.edge[0]].position.x + shapeObject.position().x,
        y: shape.vertices[edge.edge[0]].position.y + shapeObject.position().y,
    }

    const edgeEnd = {
        x: shape.vertices[edge.edge[1]].position.x + shapeObject.position().x,
        y: shape.vertices[edge.edge[1]].position.y + shapeObject.position().y,
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

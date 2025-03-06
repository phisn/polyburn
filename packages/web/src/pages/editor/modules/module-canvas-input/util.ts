import { EntityWith } from "game/src/framework/entity"
import { changeAnchor, Point, Size, Transform } from "game/src/model/utils"
import { snapDistance } from "../../constants"
import { EditorComponents } from "../../store/model"
import { CanvasEvent } from "../../views/canvas/canvas-event"

export function isPointInsideEntity(transform: Transform, size: Size) {
    const triangleArea = (a: Point, b: Point, c: Point) => {
        return (
            Math.abs(b.x * a.y - a.x * b.y + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)) / 2
        )
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = entityRect(transform, size)

    const apd = triangleArea(topLeft, bottomLeft, transform.point)
    const dpc = triangleArea(bottomLeft, bottomRight, transform.point)
    const cpb = triangleArea(bottomRight, topRight, transform.point)
    const pba = triangleArea(topRight, topLeft, transform.point)

    const total = apd + dpc + cpb + pba

    return Math.floor(total) <= Math.ceil(size.width * size.height)
}

export function entityRect(transform: Transform, size: Size) {
    // Compute the position and size of the entity's bounding box
    const topLeft = changeAnchor(
        transform.point,
        transform.rotation,
        size,
        { x: 0, y: 1 },
        { x: 0, y: 0 },
    )
    const bottomRight = changeAnchor(
        transform.point,
        transform.rotation,
        size,
        { x: 0, y: 1 },
        { x: 1, y: 1 },
    )
    const topRight = changeAnchor(
        transform.point,
        transform.rotation,
        size,
        { x: 0, y: 1 },
        { x: 1, y: 0 },
    )
    const bottomLeft = changeAnchor(
        transform.point,
        transform.rotation,
        size,
        { x: 0, y: 1 },
        { x: 0, y: 1 },
    )

    return {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
    }
}

export function findClosestEdge(
    shapeEntities: EntityWith<EditorComponents, "shape" | "transform">[],
    point: Point,
    snapDistance: number,
) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let edgeIndices: [number, number] = [0, 0]
    let shapeIndex = 0

    for (let i = 0; i < shapeEntities.length; ++i) {
        const shape = shapeEntities[i].get("shape")
        const transform = shapeEntities[i].get("transform")

        for (let j = 0; j < shape.vertices.length; ++j) {
            const p1 = {
                x: shape.vertices[j].position.x + transform.point.x,
                y: shape.vertices[j].position.y + transform.point.y,
            }

            const p2 = {
                x: shape.vertices[(j + 1) % shape.vertices.length].position.x + transform.point.x,
                y: shape.vertices[(j + 1) % shape.vertices.length].position.y + transform.point.y,
            }

            const closest = getClosestPointOnLine(p1, p2, point)
            const distance = getDistance(closest, point)

            if (distance < minDistance) {
                minDistance = distance
                closestPoint = closest
                edgeIndices = [j, (j + 1) % shape.vertices.length]
                shapeIndex = i
            }
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return { point: closestPoint, edge: edgeIndices, shapeIndex }
}

export function findClosestVertex(
    shapeEntity: EntityWith<EditorComponents, "shape" | "transform">,
    point: Point,
    snapDistance: number,
) {
    const shape = shapeEntity.get("shape")
    const transform = shapeEntity.get("transform")

    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let vertexIndex = 0

    for (let i = 0; i < shape.vertices.length; ++i) {
        const vertex = {
            x: shape.vertices[i].position.x + transform.point.x,
            y: shape.vertices[i].position.y + transform.point.y,
        }

        const distance = getDistance(vertex, point)

        if (distance < minDistance) {
            minDistance = distance
            closestPoint = vertex
            vertexIndex = i
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return {
        point: closestPoint,
        vertexIndex: vertexIndex,
    }
}

export function getClosestPointOnLine(p1: Point, p2: Point, point: Point) {
    const v = { x: p2.x - p1.x, y: p2.y - p1.y }
    const w = { x: point.x - p1.x, y: point.y - p1.y }
    const c1 = dotProduct(w, v)

    if (c1 <= 0) {
        return p1
    }

    const c2 = dotProduct(v, v)

    if (c2 <= c1) {
        return p2
    }

    const b = c1 / c2
    return { x: p1.x + b * v.x, y: p1.y + b * v.y }
}

export function dotProduct(a: Point, b: Point) {
    return a.x * b.x + a.y * b.y
}

export function getDistance(a: Point, b: Point) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}

export const findLocationForObject = (
    event: CanvasEvent,
    targetEntity: EntityWith<EditorComponents, "transform" | "size">,
    shapeEntities: EntityWith<EditorComponents, "shape" | "transform">[],
) => {
    const edge = findEdgeForEntity(event.position, true, shapeEntities)

    if (edge) {
        const transposed = changeAnchor(
            edge.point,
            edge.rotation,
            targetEntity.get("size"),
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
        targetEntity.get("size"),
        { x: 1, y: 0 },
        { x: 0.5, y: 0.5 },
    )

    return {
        position: transposed,
        rotation: 0,
    }
}

export const findEdgeForEntity = (
    position: Point,
    snap: boolean,
    shapes: EntityWith<EditorComponents, "shape" | "transform">[],
) => {
    const edge = findClosestEdge(shapes, position, snapDistance)

    if (!edge) {
        return edge
    }

    const shape = shapes[edge.shapeIndex].get("shape")
    const transform = shapes[edge.shapeIndex].get("transform")

    // edge.point is the closest point on the edge
    // edge.edge contains the two indices of the edge's vertices

    const edgeStart = {
        x: shape.vertices[edge.edge[0]].position.x + transform.point.x,
        y: shape.vertices[edge.edge[0]].position.y + transform.point.y,
    }

    const edgeEnd = {
        x: shape.vertices[edge.edge[1]].position.x + transform.point.x,
        y: shape.vertices[edge.edge[1]].position.y + transform.point.y,
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

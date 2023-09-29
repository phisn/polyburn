import { Point } from "runtime/src/model/point"
import { ShapeEntity } from "./shape"

export function findClosestEdge(shapeEntities: ShapeEntity[], point: Point, snapDistance: number) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let edgeIndices: [number, number] = [0, 0]
    let shapeIndex = 0

    for (let i = 0; i < shapeEntities.length; ++i) {
        const shape = shapeEntities[i].components.shape
        const shapeObject = shapeEntities[i].components.object

        for (let j = 0; j < shape.vertices.length; ++j) {
            const p1 = {
                x: shape.vertices[j].position.x + shapeObject.position.x,
                y: shape.vertices[j].position.y + shapeObject.position.y,
            }

            const p2 = {
                x:
                    shape.vertices[(j + 1) % shape.vertices.length].position.x +
                    shapeObject.position.x,
                y:
                    shape.vertices[(j + 1) % shape.vertices.length].position.y +
                    shapeObject.position.y,
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

export function findClosestVertex(shapeEntity: ShapeEntity, point: Point, snapDistance: number) {
    const shape = shapeEntity.components.shape
    const shapeObject = shapeEntity.components.object

    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let vertexIndex = 0

    for (let i = 0; i < shape.vertices.length; ++i) {
        const vertex = {
            x: shape.vertices[i].position.x + shapeObject.position.x,
            y: shape.vertices[i].position.y + shapeObject.position.y,
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

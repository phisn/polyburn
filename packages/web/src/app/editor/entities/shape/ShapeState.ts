import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"
import { Point } from "../../../../../../runtime/src/model/world/Point"
import { BaseEntityState } from "../../store/BaseEntityState"

export interface ShapeVertexColor {
    r: number
    g: number
    b: number
}

export function averageColor(
    a: ShapeVertexColor,
    b: ShapeVertexColor,
): ShapeVertexColor {
    return {
        r: Math.round((a.r + b.r) / 2),
        g: Math.round((a.g + b.g) / 2),
        b: Math.round((a.b + b.b) / 2),
    }
}

export function colorToHex(color: ShapeVertexColor): string {
    const r = color.r.toString(16).padStart(2, "0")
    const g = color.g.toString(16).padStart(2, "0")
    const b = color.b.toString(16).padStart(2, "0")

    return `#${r}${g}${b}`
}

export function hexToColor(hex: string): ShapeVertexColor {
    return {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
    }
}

export interface ShapeVertex {
    position: Vector2
    color: ShapeVertexColor
}

export interface ShapeState extends BaseEntityState {
    type: EntityType.Shape

    position: Vector3
    vertices: ShapeVertex[]
}

export function resolveIntersection(
    vertexIndex: number,
    moveTo: Point,
    shape: ShapeState,
) {
    function ccw(a: Point, b: Point, c: Point) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
    }

    function intersects(a: Point, b: Point, c: Point, d: Point) {
        return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)
    }

    for (let i = 0; i < shape.vertices.length; ++i) {
        const j = (i + 1) % shape.vertices.length

        if (i === vertexIndex || j === vertexIndex) {
            continue
        }

        const left =
            (vertexIndex - 1 + shape.vertices.length) % shape.vertices.length

        const right = (vertexIndex + 1) % shape.vertices.length

        if (
            (i !== right &&
                j !== right &&
                intersects(
                    moveTo,
                    shape.vertices[right].position,
                    shape.vertices[i].position,
                    shape.vertices[j].position,
                )) ||
            (i !== left &&
                j !== left &&
                intersects(
                    moveTo,
                    shape.vertices[left].position,
                    shape.vertices[i].position,
                    shape.vertices[j].position,
                ))
        ) {
            shape.vertices.splice(i + 1, 0, shape.vertices[vertexIndex])
            shape.vertices.splice(
                vertexIndex < i ? vertexIndex : vertexIndex + 1,
                1,
            )

            return vertexIndex < i ? i : i + 1
        }
    }

    return null
}

export function findIntersection(
    fromIndex: number,
    to: Point,
    shape: ShapeState,
) {
    const numVertices = shape.vertices.length

    let j = numVertices - 1

    const from = shape.vertices[fromIndex]

    function ccw(a: Point, b: Point, c: Point) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
    }

    for (let i = 0; i < numVertices; i++) {
        if (j === fromIndex || i === fromIndex) {
            continue
        }

        const from2 = shape.vertices[j]
        const to2 = shape.vertices[i]

        if (
            ccw(from.position, from2.position, to2.position) !==
                ccw(to, from2.position, to2.position) &&
            ccw(from.position, to, from2.position) !==
                ccw(from.position, to, to2.position)
        ) {
            return i
        }

        j = i
    }

    return null
}

export function isPointInsideShape(point: Point, shape: ShapeState): boolean {
    let isInside = false
    const numVertices = shape.vertices.length

    let j = numVertices - 1

    let vertexAtJ = {
        x: shape.vertices[j].position.x + shape.position.x,
        y: shape.vertices[j].position.y + shape.position.y,
    }

    for (let i = 0; i < numVertices; i++) {
        const vertexAtI = {
            x: shape.vertices[i].position.x + shape.position.x,
            y: shape.vertices[i].position.y + shape.position.y,
        }

        if (
            vertexAtI.y > point.y !== vertexAtJ.y > point.y &&
            point.x <
                ((vertexAtJ.x - vertexAtI.x) * (point.y - vertexAtI.y)) /
                    (vertexAtJ.y - vertexAtI.y) +
                    vertexAtI.x
        ) {
            isInside = !isInside
        }

        j = i
        vertexAtJ = vertexAtI
    }

    return isInside
}

export function findClosestEdge(
    shape: ShapeState,
    point: Point,
    snapDistance: number,
) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let edgeIndices: [number, number] = [0, 0]

    for (let j = 0; j < shape.vertices.length; ++j) {
        const p1 = {
            x: shape.vertices[j].position.x + shape.position.x,
            y: shape.vertices[j].position.y + shape.position.y,
        }

        const p2 = {
            x:
                shape.vertices[(j + 1) % shape.vertices.length].position.x +
                shape.position.x,
            y:
                shape.vertices[(j + 1) % shape.vertices.length].position.y +
                shape.position.y,
        }

        const closest = getClosestPointOnLine(p1, p2, point)
        const distance = getDistance(closest, point)

        if (distance < minDistance) {
            minDistance = distance
            closestPoint = closest
            edgeIndices = [j, (j + 1) % shape.vertices.length]
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return { point: closestPoint, edge: edgeIndices }
}

export function findClosestVertex(
    shape: ShapeState,
    point: Point,
    snapDistance: number,
) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let vertexIndex = 0

    for (let i = 0; i < shape.vertices.length; ++i) {
        const vertex = {
            x: shape.vertices[i].position.x + shape.position.x,
            y: shape.vertices[i].position.y + shape.position.y,
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

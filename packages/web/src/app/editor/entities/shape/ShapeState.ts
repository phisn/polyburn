import { EntityType } from "runtime/src/core/common/EntityType"
import { Vector2, Vector3 } from "three"
import { Point } from "../../../../../../runtime/src/model/world/Point"
import { BaseEntityState } from "../../store/BaseEntityState"

export interface ShapeVertexColor {
    r: number
    g: number
    b: number
}

export function averageColor(a: ShapeVertexColor, b: ShapeVertexColor): ShapeVertexColor {
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

export function canRemoveVertex(vertexIndex: number, vertices: ShapeVertex[]) {
    const left = (vertexIndex - 1 + vertices.length) % vertices.length
    const right = (vertexIndex + 1) % vertices.length

    return !findIntersection(left, right, vertices)
}

export function findIntersection(firstIndex: number, secondIndex: number, vertices: ShapeVertex[]) {
    function intersects(a: Point, b: Point, c: Point, d: Point) {
        const lacd = (d.y - a.y) * (c.x - a.x)
        const racd = (c.y - a.y) * (d.x - a.x)

        const lbcd = (d.y - b.y) * (c.x - b.x)
        const rbcd = (c.y - b.y) * (d.x - b.x)

        const labc = (c.y - a.y) * (b.x - a.x)
        const rabc = (b.y - a.y) * (c.x - a.x)

        const labd = (d.y - a.y) * (b.x - a.x)
        const rabd = (b.y - a.y) * (d.x - a.x)

        return (
            (lacd > racd !== lbcd > rbcd && labc > rabc !== labd > rabd) ||
            (lacd >= racd !== lbcd >= rbcd && labc >= rabc !== labd >= rabd)
        )
    }

    for (let i = 0; i < vertices.length; ++i) {
        const j = (i + 1) % vertices.length

        if (
            i !== firstIndex &&
            j !== firstIndex &&
            i !== secondIndex &&
            j !== secondIndex &&
            intersects(
                vertices[firstIndex].position,
                vertices[secondIndex].position,
                vertices[i].position,
                vertices[j].position,
            )
        ) {
            return [i, j]
        }
    }

    return null
}

// resolving intersections can be very complex. to prevent undesired results we only try to resolve intersections once
export function resolveConflictsAround(vertexIndex: number, vertices: ShapeVertex[]) {
    const left = (vertexIndex - 1 + vertices.length) % vertices.length
    const right = (vertexIndex + 1) % vertices.length

    const conflictTarget =
        findIntersection(vertexIndex, right, vertices) ??
        findIntersection(vertexIndex, left, vertices)

    if (conflictTarget) {
        const [newLeft, newRight] =
            conflictTarget[0] < vertexIndex ? [left + 1, right] : [left, right - 1]

        // when vertex is moved from left to right of left intersection boundary
        if (conflictTarget[0] > vertexIndex) {
            conflictTarget[0] -= 1
        }

        // when vertex is moved from right to left of right intersection boundary
        if (conflictTarget[1] < vertexIndex) {
            conflictTarget[1] += 1
        }

        const vertex = vertices[vertexIndex]
        const newVertexIndex = conflictTarget[0] + 1

        console.warn("resolving intersection")

        vertices.splice(vertexIndex, 1)
        vertices.splice(newVertexIndex, 0, vertex)

        if (
            // ensure no intersection in new target location
            findIntersection(conflictTarget[0], newVertexIndex, vertices) ??
            findIntersection(newVertexIndex, conflictTarget[1], vertices) ??
            // ensure no intersection on old location
            findIntersection(newLeft, newRight, vertices)
        ) {
            // undo changes
            vertices.splice(newVertexIndex, 1)
            vertices.splice(vertexIndex, 0, vertex)

            console.warn("unable to resolve intersection")

            // not able to resolve intersection
            return null
        }

        // intersection successfully resolved
        return newVertexIndex
    }

    // no intersection found. vertices stay the same
    return vertexIndex
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

export function findClosestEdge(shape: ShapeState, point: Point, snapDistance: number) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let edgeIndices: [number, number] = [0, 0]

    for (let j = 0; j < shape.vertices.length; ++j) {
        const p1 = {
            x: shape.vertices[j].position.x + shape.position.x,
            y: shape.vertices[j].position.y + shape.position.y,
        }

        const p2 = {
            x: shape.vertices[(j + 1) % shape.vertices.length].position.x + shape.position.x,
            y: shape.vertices[(j + 1) % shape.vertices.length].position.y + shape.position.y,
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

export function findClosestVertex(shape: ShapeState, point: Point, snapDistance: number) {
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

import { getClosestPointOnLine, getDistance } from "./Point"

export interface Point {
    x: number
    y: number
}

export interface ShapeModel {
    vertices: Point[]
}

export function isPointInsideShape(point: Point, shape: ShapeModel): boolean {
    let isInside = false
    const numVertices = shape.vertices.length
    let j = numVertices - 1
  
    for (let i = 0; i < numVertices; i++) {
        if ((shape.vertices[i].y > point.y) !== (shape.vertices[j].y > point.y) 
          && point.x < (
              (shape.vertices[j].x - shape.vertices[i].x) * (point.y - shape.vertices[i].y)
          ) / (shape.vertices[j].y - shape.vertices[i].y) + shape.vertices[i].x
        ) {
            isInside = !isInside
        }

        j = i
    }
  
    return isInside
}

export function findClosestEdge(shapes: ShapeModel[], point: Point, snapDistance: number) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let shapeIndex = 0
    let edgeIndices: [ number, number] = [ 0, 0 ]

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const p1 = shapes[i].vertices[j]
            const p2 = shapes[i].vertices[(j + 1) % shapes[i].vertices.length]

            const closest = getClosestPointOnLine(p1, p2, point)
            const distance = getDistance(closest, point)

            if (distance < minDistance) {
                minDistance = distance
                closestPoint = closest

                shapeIndex = i
                edgeIndices = [j, (j + 1) % shapes[i].vertices.length]
            }
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return { point: closestPoint, shapeIndex: shapeIndex, edge: edgeIndices }
}
        
export function findClosestVertex(shapes: ShapeModel[], point: Point, snapDistance: number) {
    let minDistance = Number.MAX_VALUE
    let closestPoint: Point = { x: 0, y: 0 }
    let shapeIndex = 0
    let vertexIndex = 0

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const distance = getDistance(shapes[i].vertices[j], point)

            if (distance < minDistance) {
                minDistance = distance
                closestPoint = shapes[i].vertices[j]
                shapeIndex = i
                vertexIndex = j
            }
        }
    }

    if (minDistance > snapDistance) {
        return null
    }

    return { point: closestPoint, shapeIndex: shapeIndex, vertexIndex: vertexIndex }
}

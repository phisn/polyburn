import { Point } from "runtime/src/model/point"
import { Circle, Polygon } from "sat"

export interface Environment {
    query(aabb: Aabb): Polygon[]
}

interface Shape {
    aabb: Aabb
    polygon: Polygon
}

type SplitType = "horizontal" | "vertical"

type Node =
    | {
          type: "leaf"
          shapes: Shape[]
      }
    | {
          type: "node"
          splitType: SplitType
          splitMin: number
          splitMax: number
          min: Node
          max: Node
          mid: Node
      }

export function newEnvironment(polygons: Polygon[]): Environment {
    function buildTree(shapes: Shape[]): Node {
        if (shapes.length <= 16) {
            return {
                type: "leaf",
                shapes,
            }
        }

        const splitX = findSplit(shapes, "vertical")
        const splitY = findSplit(shapes, "horizontal")

        const split = splitX.score > splitY.score ? splitX : splitY

        const recursiveMin = buildTree(split.minShapes)
        const recursiveMax = buildTree(split.maxShapes)
        const recursiveMid = buildTree(split.midShapes)

        return {
            type: "node",
            splitType: split.splitType,
            splitMin: split.min,
            splitMax: split.max,
            min: recursiveMin,
            max: recursiveMax,
            mid: recursiveMid,
        }
    }

    function findSplit(shapes: Shape[], splitType: SplitType) {
        let temp

        if (splitType === "horizontal") {
            temp = shapes.map(x => [x.aabb.minY, x.aabb.maxY, x] as const)
        } else {
            temp = shapes.map(x => [x.aabb.minX, x.aabb.maxX, x] as const)
        }

        const splitAverages = temp.map(([min, max]) => (min + max) / 2)
        const splitAverageSum = splitAverages.reduce((a, b) => a + b, 0)
        const splitAverage = splitAverageSum / splitAverages.length

        const minShapes = []
        const maxShapes = []
        const midShapes = []

        let min = Infinity
        let max = -Infinity

        let minScore = 0
        let maxScore = 0

        for (const [shapeMin, shapeMax, shape] of temp) {
            if (shapeMax < splitAverage) {
                max = Math.max(max, shapeMax)
                minScore += 1
                minShapes.push(shape)

                continue
            }

            if (shapeMin > splitAverage) {
                min = Math.min(min, shapeMin)
                maxScore += 1
                maxShapes.push(shape)

                continue
            }

            midShapes.push(shape)
        }

        return {
            splitType,
            min,
            max,
            minShapes,
            maxShapes,
            midShapes,
            score: Math.min(minScore, maxScore),
        }
    }

    function queryRecursive(node: Node, aabb: Aabb, result: Polygon[]) {
        if (node.type === "leaf") {
            for (const shape of node.shapes) {
                if (aabbIntersects(aabb, shape.aabb)) {
                    result.push(shape.polygon)
                }
            }
        } else {
            if (node.splitType === "vertical") {
                if (aabb.maxX > node.splitMin) {
                    queryRecursive(node.max, aabb, result)
                }

                if (aabb.minX < node.splitMax) {
                    queryRecursive(node.min, aabb, result)
                }

                queryRecursive(node.mid, aabb, result)
            } else {
                if (aabb.maxY > node.splitMin) {
                    queryRecursive(node.max, aabb, result)
                }

                if (aabb.minY < node.splitMax) {
                    queryRecursive(node.min, aabb, result)
                }

                queryRecursive(node.mid, aabb, result)
            }
        }
    }

    const shapes = polygons.map(x => ({
        aabb: aabbFromPoints(x.points),
        polygon: x,
    }))

    const root = buildTree(shapes)

    return {
        query(aabb) {
            const result: Polygon[] = []
            queryRecursive(root, aabb, result)
            return result
        },
    }
}

export interface Aabb {
    minX: number
    minY: number
    maxX: number
    maxY: number
}

export function aabbFromPoints(points: Point[]) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const point of points) {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
    }

    return { minX, minY, maxX, maxY }
}

export function aabbFromCircle(circle: Circle) {
    return {
        minX: circle.pos.x - circle.r,
        minY: circle.pos.y - circle.r,
        maxX: circle.pos.x + circle.r,
        maxY: circle.pos.y + circle.r,
    }
}

export function aabbIntersects(a: Aabb, b: Aabb) {
    return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

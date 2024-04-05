import { Box, Polygon } from "sat"

interface Shape {
    aabb: { minX: number; minY: number; maxX: number; maxY: number }
    polygon: SAT.Polygon
}

function shapeFromPolygon(polygon: SAT.Polygon): Shape {
    const aabb = polygon.points.reduce(
        (acc, point) => {
            return {
                minX: Math.min(acc.minX, point.x),
                minY: Math.min(acc.minY, point.y),
                maxX: Math.max(acc.maxX, point.x),
                maxY: Math.max(acc.maxY, point.y),
            }
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    )

    return { aabb, polygon }
}

enum SplitType {
    Horizontal,
    Vertical,
}

interface Split {
    split_type: SplitType
    min: number
    max: number
}

class SplitResult {
    split: Split
    min_shapes: Shape[]
    max_shapes: Shape[]
    mid_shapes: Shape[]
    score: number

    constructor(
        split: Split,
        min_shapes: Shape[],
        max_shapes: Shape[],
        mid_shapes: Shape[],
        score: number,
    ) {
        this.split = split
        this.min_shapes = min_shapes
        this.max_shapes = max_shapes
        this.mid_shapes = mid_shapes
        this.score = score
    }
}

type Node = LeafNode | InternalNode

class LeafNode {
    shapes: Shape[]

    constructor(shapes: Shape[]) {
        this.shapes = shapes
    }
}

class InternalNode {
    split: Split
    min: Node
    max: Node
    mid: Node

    constructor(split: Split, min: Node, max: Node, mid: Node) {
        this.split = split
        this.min = min
        this.max = max
        this.mid = mid
    }
}

export class Environment {
    tree: Node

    constructor(polygons: SAT.Polygon[]) {
        const shapes = polygons.map(x => shapeFromPolygon(x))
        this.tree = this.buildTree(shapes)
    }

    query(aabb: SAT.Polygon): (Polygon | Box)[] {
        const result: (Polygon | Box)[] = []
        this.queryRecursive(this.tree, aabb, result)
        return result
    }

    private queryRecursive(node: Node, aabb: SAT.Polygon, result: (Polygon | Box)[]) {}

    private buildTree(shapes: Shape[]): Node {
        if (shapes.length <= 16) {
            return new LeafNode(shapes)
        }

        const splitX = this.findSplit(shapes, SplitType.Vertical)
        const splitY = this.findSplit(shapes, SplitType.Horizontal)

        const split = splitX.score < splitY.score ? splitY : splitX

        const recursiveMin = this.buildTree(split.min_shapes)
        const recursiveMax = this.buildTree(split.max_shapes)
        const recursiveMid = this.buildTree(split.mid_shapes)

        return new InternalNode(split.split, recursiveMin, recursiveMax, recursiveMid)
    }

    private findSplit(shapes: Shape[], split_type: SplitType): SplitResult {
        const shapes = 
    }
}

// Example usage of SAT for AABB checks and other operations would be defined here
// Note: Actual collision detection, shape manipulation, and AABB calculation
// with `sat` would require using its API directly.

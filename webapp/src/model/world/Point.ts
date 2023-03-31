export interface Point {
    x: number
    y: number
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

function doEdgesIntersect(p1: Point, p2: Point, q1: Point, q2: Point): boolean {
    // Calculate the direction vectors of the edges
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y }
    const v2 = { x: q2.x - q1.x, y: q2.y - q1.y }
    
    // Calculate the cross products of the direction vectors
    const cross1 = v1.x * (q1.y - p1.y) - v1.y * (q1.x - p1.x)
    const cross2 = v1.x * (q2.y - p1.y) - v1.y * (q2.x - p1.x)
    const cross3 = v2.x * (p1.y - q1.y) - v2.y * (p1.x - q1.x)
    const cross4 = v2.x * (p2.y - q1.y) - v2.y * (p2.x - q1.x)
    
    // Check if the edges intersect
    if (cross1 * cross2 >= 0 || cross3 * cross4 >= 0) {
        return false
    }
    
    return true
}
  
export function hasAnyEdgeIntersections(vertices: Point[]): boolean {
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i]
        const p2 = vertices[(i + 1) % vertices.length]
  
        for (let j = i + 1; j < vertices.length; j++) {
            const q1 = vertices[j]
            const q2 = vertices[(j + 1) % vertices.length]
  
            if (doEdgesIntersect(p1, p2, q1, q2)) {
                return true
            }
        }
    }
  
    return false
}

export function areVerticesClockwise(vertices: Point[]): boolean {
    const n = vertices.length
    let sum = 0
    
    for (let i = 0; i < n; i++) {
        const p1 = vertices[i]
        const p2 = vertices[(i + 1) % n]
      
        sum += (p2.x - p1.x) * (p2.y + p1.y)
    }
    
    return sum > 0
}

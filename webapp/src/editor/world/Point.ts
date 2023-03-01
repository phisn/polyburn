export interface Point {
    x: number
    y: number
}

export function getClosestPointOnLine(p1: Point, p2: Point, point: Point) {
    const v = { x: p2.x - p1.x, y: p2.y - p1.y };
    const w = { x: point.x - p1.x, y: point.y - p1.y };
    const c1 = dotProduct(w, v);
    
    if (c1 <= 0) {
        return p1;
    }
    
    const c2 = dotProduct(v, v);
    
    if (c2 <= c1) {
        return p2;
    }

    const b = c1 / c2;
    return { x: p1.x + b * v.x, y: p1.y + b * v.y };
}

export function dotProduct(a: Point, b: Point) {
    return a.x * b.x + a.y * b.y;
}

export function getDistance(a: Point, b: Point) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

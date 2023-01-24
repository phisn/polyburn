export interface Vertex {
    x: number
    y: number
}

export interface Shape {
    vertices: Vertex[]
}

export interface World {
    shapes: Shape[]
}

export interface VertexIdentifier {
    point: Vertex
    shapeIndex: number
    vertexIndex: number
}
        
export function findClosestVertex(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex = { x: 0, y: 0 };
    let shapeIndex: number = 0;
    let vertexIndex: number = 0;

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const distance = getDistance(shapes[i].vertices[j], point);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = shapes[i].vertices[j];
                shapeIndex = i;
                vertexIndex = j;
            }
        }
    }

    if (minDistance > snapDistance) {
        return null;
    }

    return { point: closestPoint, shapeIndex: shapeIndex, vertexIndex: vertexIndex };
}

export function findClosestEdge(shapes: Shape[], point: Vertex, snapDistance: number) {
    let minDistance = Number.MAX_VALUE;
    let closestPoint: Vertex = { x: 0, y: 0 };
    let shapeIndex: number = 0;
    let edgeIndices: [ number, number] = [ 0, 0 ];

    for (let i = 0; i < shapes.length; i++) {
        for (let j = 0; j < shapes[i].vertices.length; ++j) {
            const p1 = shapes[i].vertices[j];
            const p2 = shapes[i].vertices[(j + 1) % shapes[i].vertices.length];

            const closest = getClosestPointOnEdge(p1, p2, point);
            const distance = getDistance(closest, point);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = closest;

                shapeIndex = i;
                edgeIndices = [j, (j + 1) % shapes[i].vertices.length];
            }
        }
    }

    if (minDistance > snapDistance) {
        return null;
    }

    return { point: closestPoint, shapeIndex: shapeIndex, edge: edgeIndices };
}

function getClosestPointOnEdge(p1: Vertex, p2: Vertex, point: Vertex) {
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

function dotProduct(a: Vertex, b: Vertex) {
    return a.x * b.x + a.y * b.y;
}

function getDistance(a: Vertex, b: Vertex) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
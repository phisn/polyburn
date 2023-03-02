import { Point } from "../world/Point"

export enum HintType {
    Space,
    Vertex,
    Edge,
    Object
}

export interface SpaceHint {
    type: HintType.Space
}

export interface VertexHint {
    type: HintType.Vertex
    point: Point
    delete: boolean
    
    shapeIndex: number
    vertexIndex: number
}

export interface EdgeHint {
    type: HintType.Edge
    point: Point

    shapeIndex: number
    edge: [number, number]
}

export interface ObjectHint {
    type: HintType.Object
}

export type PlacementHint = SpaceHint | VertexHint | EdgeHint | ObjectHint

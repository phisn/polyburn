import { Point } from "../../../model/world/Point"

export enum HintType {
    Space,
    Vertex,
    Edge,
    Entity
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

export interface EntityHint {
    type: HintType.Entity
    delete: boolean

    entityIndex: number
}

export type PlacementHint = SpaceHint | VertexHint | EdgeHint | EntityHint
import { Point } from "../world/Point"

export enum ActionType {
    MoveVertex
}

export interface MoveVertexAction {
    type: ActionType.MoveVertex

    shapeIndex: number
    vertexIndex: number

    point: Point
}

export type Action = MoveVertexAction
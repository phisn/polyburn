import { EntityType } from "../../world/Entity"
import { Point } from "../../world/Point"

export enum ActionType {
    MoveVertex,
    PlaceEntity
}

export interface MoveVertexAction {
    type: ActionType.MoveVertex

    shapeIndex: number
    vertexIndex: number

    point: Point
}

export interface PlaceEntityAction {
    type: ActionType.PlaceEntity
    entityType: EntityType

    point: Point | null
}

export type Action = MoveVertexAction | PlaceEntityAction
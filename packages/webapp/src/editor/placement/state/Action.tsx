import { EntityType } from "../../../model/world/EntityType"
import { Point } from "../../../model/world/Point"
import { EntityInPlacing } from "./EntityInPlacing"

export enum ActionType {
    MoveVertex,
    InsertVertex,
    PlaceEntityInFuture,
    PlaceEntity
}

export interface MoveVertexAction {
    type: ActionType.MoveVertex

    shapeIndex: number
    vertexIndex: number

    point: Point
}

export interface InsertVertexAction {
    type: ActionType.InsertVertex

    shapeIndex: number
    vertexAfterIndex: number

    point: Point
}

export interface PlaceEntityAction {
    type: ActionType.PlaceEntity
    entity: EntityInPlacing
}

export interface PlaceEntityInFutureAction {
    type: ActionType.PlaceEntityInFuture
    entityType: EntityType
}

export type PlacementAction = MoveVertexAction 
    | InsertVertexAction 
    | PlaceEntityAction 
    | PlaceEntityInFutureAction

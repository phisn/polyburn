import { Entity, EntityType } from "../../../model/world/Entity"
import { Point } from "../../../model/world/Point"

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
    entity: Entity
}

export interface PlaceEntityInFutureAction {
    type: ActionType.PlaceEntityInFuture
    entityType: EntityType
}

export type PlacementAction = MoveVertexAction 
    | InsertVertexAction 
    | PlaceEntityAction 
    | PlaceEntityInFutureAction

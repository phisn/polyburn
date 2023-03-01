export {}
/*
import { PlaceableObject, Shape } from "../../../World"

export enum PlacementHandlerType {
    Default,
    PlaceObject,
    MoveVertex,
}

export type CommonHandlerProps = {
    setHandler: (handler: PlacementHandlerProps) => void
}

export type DefaultHandlerProps = {
} & CommonHandlerProps

export type MoveVertexHandlerProps = {
    vertexIndex: number
    shapeIndex: number
    shape: Shape
} & CommonHandlerProps

export type PlaceObjectHandlerProps = {
    obj: PlaceableObject
} & CommonHandlerProps

export type PlacementHandlerProps = 
      DefaultHandlerProps     & { type: PlacementHandlerType.Default } 
    | MoveVertexHandlerProps  & { type: PlacementHandlerType.MoveVertex }
    | PlaceObjectHandlerProps & { type: PlacementHandlerType.PlaceObject }
*/
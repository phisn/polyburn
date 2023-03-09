import { Point } from "../../model/world/Point"

export enum RocketStateType {
    Alive = "Alive",
}

export interface RocketAliveState {
    type: RocketStateType.Alive
    position: Point
    rotation: number
}

export type RocketState = RocketAliveState

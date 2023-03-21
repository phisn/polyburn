import { Point } from "../../../model/world/Point"

export enum ActionType {
    MoveCamera
}

export interface MoveCameraAction {
    type: ActionType.MoveCamera

    point: Point
    entityIndex: number
    side: "left" | "right" | "top" | "bottom"
}

export type ConfigureAction = MoveCameraAction

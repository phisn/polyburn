import { Selectable } from "./Selectable"

export enum HintType {
    Space = "Space",
    Selectable = "Selectable",
    FlagCamera = "FlagCamera"
}

export interface SpaceHint {
    type: HintType.Space
}

export interface SelectableHint {
    type: HintType.Selectable
    selectable: Selectable
}

export interface FlagCameraHint {
    type: HintType.FlagCamera
    side: "left" | "right" | "top" | "bottom"
    entityIndex: number
}

export type ConfigureHint = SpaceHint 
    | SelectableHint
    | FlagCameraHint

export enum HintType {
    Space = "Space",
    Shape = "Shape",
    Entity = "Entity",
    FlagCamera = "FlagCamera"
}

export interface SpaceHint {
    type: HintType.Space
}

export interface ShapeHint {
    type: HintType.Shape
    shapeIndex: number
}

export interface EntityHint {
    type: HintType.Entity
    entityIndex: number
}

export interface FlagCameraHint {
    type: HintType.FlagCamera
    side: "left" | "right" | "top" | "bottom"
    entityIndex: number
}

export type ConfigureHint = SpaceHint 
    | ShapeHint 
    | EntityHint
    | FlagCameraHint

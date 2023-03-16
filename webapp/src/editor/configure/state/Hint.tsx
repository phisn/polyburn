export enum HintType {
    Space = "Space",
    Shape = "Shape",
    Entity = "Entity"
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

export type ConfigureHint = SpaceHint | ShapeHint | EntityHint

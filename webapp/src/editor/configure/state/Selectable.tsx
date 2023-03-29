
export enum SelectableType {
    Shape = "shape",
    Entity = "entity",
}

export interface SelectableEntity {
    type: SelectableType.Entity,
    entityIndex: number,
}

export interface SelectableShape {
    type: SelectableType.Shape,
    shapeIndex: number,
}

export type Selectable = 
      SelectableEntity
    | SelectableShape

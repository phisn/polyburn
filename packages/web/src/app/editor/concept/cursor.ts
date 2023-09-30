export enum CursorType {
    Normal,
    Grabbable,
    Grabbing,
    ResizeHorizontal,
    ResizeVertical,
}

export interface CursorManager {
    normal(): void
    grabbable(): void
    grabbing(): void
}

import { Point } from "../world/Point";
import { Mode, ModeStateBase } from "./EditorStore";

export enum HintType {
    Vertex,
    Edge,
    Object,
    Space
}

export interface PlacementHint {
    type: HintType
    point: Point
    delete: boolean
}

export interface PlacementState extends ModeStateBase {
    mode: Mode.Placement
    hint: PlacementHint | null
}

export const initialPlacementState: PlacementState = {
    mode: Mode.Placement,
    hint: null
}

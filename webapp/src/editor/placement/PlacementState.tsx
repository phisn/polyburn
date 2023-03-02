import { Point } from "../world/Point";
import { Mode, ModeStateBase } from "../editor-store/ModeStateBase";
import { Action } from "./Action";
import { PlacementHint } from "./Hint";

export interface PlacementState extends ModeStateBase {
    mode: Mode.Placement
    hint: PlacementHint | null
    action: Action | null
}

export const initialPlacementState: PlacementState = {
    mode: Mode.Placement,
    action: null,
    hint: null
}

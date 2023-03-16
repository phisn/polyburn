import { Mode, ModeStateBase } from "../../editor-store/ModeStateBase"
import { PlacementAction } from "./Action"
import { PlacementHint } from "./Hint"

export interface PlacementState extends ModeStateBase {
    mode: Mode
    hint: PlacementHint | null
    action: PlacementAction | null
}

export const initialPlacementState: PlacementState = {
    mode: Mode.Placement,
    action: null,
    hint: null
}

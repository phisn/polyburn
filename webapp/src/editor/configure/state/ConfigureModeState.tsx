import { Mode, ModeStateBase } from "../../editor-store/ModeStateBase"
import { MoveCameraAction } from "./Action"
import { ConfigureHint } from "./Hint"
import { Selectable } from "./Selectable"

export interface ConfigureState extends ModeStateBase {
    mode: Mode,
    selected: Selectable | null,
    hint: ConfigureHint | null,
    action: MoveCameraAction | null
}

export const initialConfigureState: ConfigureState = {
    mode: Mode.Configure,
    selected: null,
    hint: null,
    action: null
}

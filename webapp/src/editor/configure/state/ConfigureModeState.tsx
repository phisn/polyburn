import { Mode, ModeStateBase } from "../../editor-store/ModeStateBase"
import { MoveCameraAction } from "./Action"
import { ConfigureHint } from "./Hint"

export interface ConfigureState extends ModeStateBase {
    mode: Mode,
    hint: ConfigureHint | null,
    action: MoveCameraAction | null
}

export const initialConfigureState: ConfigureState = {
    mode: Mode.Configure,
    hint: null,
    action: null
}

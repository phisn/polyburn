import { Mode, ModeStateBase } from "../../editor-store/ModeStateBase"
import { ConfigureHint } from "./Hint"

export interface ConfigureState extends ModeStateBase {
    mode: Mode,
    hint: ConfigureHint | null,
    action: null
}

export const initialConfigureState: ConfigureState = {
    mode: Mode.Configure,
    hint: null,
    action: null
}

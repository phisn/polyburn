import { EditorStore } from "../store/store"
import { ModuleCanvas } from "./module-canvas/module-canvas"
import { ModuleInput } from "./module-input"

export class EditorModules {
    private moduleCanvas: ModuleCanvas
    private moduleInput: ModuleInput

    constructor(private store: EditorStore) {
        this.moduleCanvas = new ModuleCanvas(store)
        this.moduleInput = new ModuleInput(store)
    }

    onDispose() {
        this.moduleCanvas.onDispose()
        this.moduleInput.onDispose()
    }
}

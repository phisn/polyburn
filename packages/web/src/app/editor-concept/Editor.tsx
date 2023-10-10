import { ProvideEditorStore } from "./store/StoreProvider"
import { Canvas } from "./views/canvas/Canvas"

export function Editor() {
    return (
        <ProvideEditorStore>
            <Canvas />
        </ProvideEditorStore>
    )
}

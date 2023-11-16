import { useMemo } from "react"
import { createEditorStore, editorStoreContext } from "./store/store"
import { Canvas } from "./views/view-canvas/Canvas"

export function Editor() {
    const store = useMemo(() => createEditorStore(), [])

    return (
        <editorStoreContext.Provider value={store}>
            <Canvas />
        </editorStoreContext.Provider>
    )
}

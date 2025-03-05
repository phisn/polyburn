import { useEffect, useRef } from "react"
import { EditorModules } from "./modules/modules"
import { EditorStore, EditorStoreContext } from "./store/store"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"

export function Editor() {
    const storeRef = useRef(new EditorStore())

    useEffect(() => {
        const modules = new EditorModules(storeRef.current)
        return modules.onDispose()
    }, [])

    return (
        <EditorStoreContext.Provider value={storeRef.current}>
            <div className="relative h-max w-full grow">
                <Canvas />
                <Hierarchy />
            </div>
        </EditorStoreContext.Provider>
    )
}

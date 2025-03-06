import { useEffect, useState } from "react"
import { EditorModules } from "./modules/modules"
import { EditorStore, EditorStoreContext } from "./store/store"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"

export function Editor() {
    const [store, setStore] = useState<EditorStore | undefined>()

    useEffect(() => {
        const store = new EditorStore()
        const modules = new EditorModules(store)

        setStore(store)

        return () => {
            modules.onDispose()
            setStore(undefined)
        }
    }, [])

    if (store === undefined) {
        return undefined
    }

    return (
        <EditorStoreContext.Provider value={store}>
            <div className="relative h-max w-full grow">
                <Canvas />
                <Hierarchy />
            </div>
        </EditorStoreContext.Provider>
    )
}

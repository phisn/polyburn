import { createContext, useContext, useMemo } from "react"
import { EditorStore, createEditorStore } from "./editor-store"

const context = createContext<EditorStore | undefined>(undefined)

export function useEditorStore() {
    const store = useContext(context)

    if (!store) {
        throw new Error("No store provided")
    }

    return store
}

export function ProvideEditorStore(props: { children: React.ReactNode }) {
    const store = useMemo(() => createEditorStore(), [])
    return <context.Provider value={store}>{props.children}</context.Provider>
}

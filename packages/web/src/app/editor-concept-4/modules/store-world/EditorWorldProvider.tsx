import { createContext, useContext, useMemo } from "react"
import { EditorStoreWorld, createEditorStoreWorld } from "./store-world"

const context = createContext<EditorStoreWorld | undefined>(undefined)

export function useEditorWorld() {
    const store = useContext(context)

    if (!store) {
        throw new Error("No store provided")
    }

    return store
}

export function ProvideEditorWorld(props: { children: React.ReactNode }) {
    const store = useMemo(() => createEditorStoreWorld(), [])
    return <context.Provider value={store}>{props.children}</context.Provider>
}

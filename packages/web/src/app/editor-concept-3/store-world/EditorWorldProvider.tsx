import { createContext, useContext, useMemo } from "react"
import { EditorWorld, createEditorWorld } from "./editor-world"

const context = createContext<EditorWorld | undefined>(undefined)

export function useEditorWorld() {
    const store = useContext(context)

    if (!store) {
        throw new Error("No store provided")
    }

    return store
}

export function ProvideEditorWorld(props: { children: React.ReactNode }) {
    const store = useMemo(() => createEditorWorld(), [])
    return <context.Provider value={store}>{props.children}</context.Provider>
}

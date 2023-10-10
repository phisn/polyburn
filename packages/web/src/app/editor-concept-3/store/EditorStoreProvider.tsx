import { createContext, useContext, useMemo } from "react"
import { EntityStore, createStore } from "./editor-store"

const context = createContext<EntityStore | undefined>(undefined)

export function useEditorStore() {
    const store = useContext(context)

    if (!store) {
        throw new Error("No store provided")
    }

    return store
}

export function ProvideEditorStore(props: { children: React.ReactNode }) {
    const store = useMemo(() => createStore(), [])
    return <context.Provider value={store}>{props.children}</context.Provider>
}

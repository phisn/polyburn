import { createContext, useContext, useSyncExternalStore } from "react"
import { EntityState } from "./EntityState"

interface Mutation {
    do: () => void
    undo: () => void
}

interface EditorStore {
    subscribe: () => () => void
    mutate: (mutation: Mutation) => void

    entities: EntityState[]
}

export const createEditorStore = (): EditorStore => {
    return {
        subscribe: () => () => {},
        mutate: () => {},
        entities: [],
    }
}

const EditorStoreContext = createContext<EditorStore>(null!)

export function useEditorStore() {
    const store = useContext(EditorStoreContext)
    return useSyncExternalStore(store.subscribe, () => store)
}

export function ProvideEditorStore(props: {
    children: JSX.Element
    store: EditorStore
}) {
    return (
        <EditorStoreContext.Provider value={props.store}>
            {props.children}
        </EditorStoreContext.Provider>
    )
}

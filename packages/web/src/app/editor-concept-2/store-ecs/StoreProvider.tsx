import { createContext, useContext, useMemo } from "react"
import { useStore } from "zustand"
import { WorldEditModel } from "./edit-models/world-edit-model"
import { EditorStore, EditorStoreApi, createStore } from "./store"

const context = createContext<EditorStoreApi | undefined>(undefined)

export function useEditorStore<U>(
    selector: (state: EditorStore) => U,
    equalityFn?: (a: U, b: U) => boolean,
) {
    const storeApi = useContext(context)

    if (storeApi === undefined) {
        throw new Error("useEditorStore called outside of ProvideEditorStore")
    }

    return useStore(storeApi, selector, equalityFn)
}

export function ProvideEditorStore(props: { children: React.ReactNode; init?: WorldEditModel }) {
    const store = useMemo(() => createStore(props.init), [props.init])
    return <context.Provider value={store}>{props.children}</context.Provider>
}

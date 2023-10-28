import { createContext, useContext, useMemo } from "react"
import { StoreApi, UseBoundStore, useStore } from "zustand"
import { EditorStore, createEditorStore } from "./editor-store"

const Context = createContext<UseBoundStore<StoreApi<EditorStore>>>(null!)

export function ProvideWorldStore(props: { children: React.ReactNode }) {
    const store = useMemo(() => createEditorStore(), [])
    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEditorStore<U>(
    selector: (state: EditorStore) => U,
    equalityFn?: (a: U, b: U) => boolean,
) {
    return useStore(useContext(Context), selector, equalityFn)
}

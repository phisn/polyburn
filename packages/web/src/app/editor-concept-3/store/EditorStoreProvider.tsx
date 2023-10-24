const Context = createContext<UseBoundStore<StoreApi<WorldStore>>>(null!)

export function ProvideWorldStore(props: { children: React.ReactNode; world: WorldState }) {
    const store = createEditorStore(props.world)
    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEditorStore<U>(
    selector: (state: WorldStore) => U,
    equalityFn?: (a: U, b: U) => boolean,
) {
    return useStore(useContext(Context), selector, equalityFn)
}

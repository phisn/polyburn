import { createContext, useContext, useMemo, useSyncExternalStore } from "react"
import { LevelState } from "../entities/LevelState"
import { RocketState } from "../entities/RocketState"
import { ShapeState } from "../entities/ShapeState"

export type EntityState = ShapeState | RocketState | LevelState

interface Mutation {
    mutates: number[]

    do: () => void
    undo: () => void
}

interface EntityStore {
    subscribeMutation: (listener: (mutation: Mutation) => void) => () => void
    mutation: (mutation: Mutation) => void
    entities: Map<number, EntityState>
}

const createEntityStore = (): EntityStore => {
    return {
        subscribeMutation: () => () => {},
        mutation: () => {},
        entities: new Map(),
    }
}

const Context = createContext<EntityStore>(null!)

export function ProvideEntityStore(props: { children: React.ReactNode }) {
    const store = useMemo(createEntityStore, [])

    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEntities() {
    const store = useContext(Context)
    return useSyncExternalStore(store.subscribeMutation, () => store.entities)
}

export function useEntity<T>(entity: number) {
    const store = useContext(Context)

    return useSyncExternalStore(
        listener =>
            store.subscribeMutation(mutation => {
                if (mutation.mutates.includes(entity)) {
                    listener()
                }
            }),
        () => store.entities.get(entity) as T,
    )
}

export function useMutationDispatch() {
    return useContext(Context).mutation
}


import { createContext, useContext, useMemo, useSyncExternalStore } from "react"
import { LevelState } from "../entities/LevelState"
import { RocketState } from "../entities/RocketState"
import { ShapeState } from "../entities/shape/ShapeState"

export type EntityState = ShapeState | RocketState | LevelState

export interface Mutation {
    mutates: number[]
    removeOrCreate: boolean

    do: (store: EntityStore) => void
    undo: (store: EntityStore) => void
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

export function ProvideEntityStore(props: {
    children: React.ReactNode
    entities: EntityState[]
}) {
    const store = useMemo(createEntityStore, [])

    for (const entity of props.entities) {
        store.entities.set(entity.id, entity)
    }

    return <Context.Provider value={store}>{props.children}</Context.Provider>
}

export function useEntities() {
    const store = useContext(Context)
    return useSyncExternalStore(
        listener =>
            store.subscribeMutation(mutation => {
                if (mutation.removeOrCreate) {
                    listener()
                }
            }),
        () => store.entities,
    )
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

export function useGamemodes() {}

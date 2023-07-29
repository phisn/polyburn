import { createContext, useContext, useReducer } from "react"
import { WorldState } from "../models/WorldState"

interface State {
    world: WorldState

    done: Mutation[]
    todo: Mutation[]
}

export interface Mutation {
    do: () => void
    undo: () => void
}

export type Action = Mutation | "undo" | "redo"

function Reducer(state: State, action: Action) {
    if (action === "undo") {
        if (state.done.length === 0) {
            return state
        }

        const last = state.done[state.done.length - 1]

        last.undo()

        return {
            ...state,
            done: state.done.slice(0, state.done.length - 1),
            todo: [...state.todo, last],
        }
    }

    if (action === "redo") {
        if (state.todo.length === 0) {
            return state
        }

        const last = state.todo[state.todo.length - 1]

        last.do()

        return {
            ...state,
            done: [...state.done, last],
            todo: state.todo.slice(0, state.todo.length - 1),
        }
    }

    action.do()

    return {
        ...state,
        done: [...state.done, action],
        todo: [],
    }
}

export interface WorldStore {
    state: WorldState
    dispatch: (mutation: Action) => void

    canUndo: boolean
    canRedo: boolean
}

const Context = createContext<WorldStore>(null!)

export function ProvideWorldStore(props: { children: React.ReactNode; default: WorldState }) {
    const [state, dispatch] = useReducer(Reducer, {
        world: props.default,
        done: [],
        todo: [],
    })

    console.log(state)

    return (
        <Context.Provider
            value={{
                state: state.world,
                dispatch,
                canUndo: state.done.length > 0,
                canRedo: state.todo.length > 0,
            }}
        >
            {props.children}
        </Context.Provider>
    )
}

export function useWorldStore() {
    return useContext(Context).state
}

export function useMutationDispatch() {
    return useContext(Context).dispatch
}

export function useCanUndoRedo() {
    const store = useContext(Context)
    return [store.canUndo, store.canRedo]
}

/*
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
*/

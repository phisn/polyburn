import { createContext, useContext } from "react"
import { StoreApi, UseBoundStore, create, useStore } from "zustand"
import { GamemodeState, WorldState } from "../models/WorldState"

interface State {
    world: WorldState

    done: Mutation[]
    todo: Mutation[]
}

export interface Mutation {
    do: (world: WorldState) => void
    undo: (world: WorldState) => void
}

interface WorldStore {
    gamemode?: GamemodeState

    state: State
    canUndo: boolean
    canRedo: boolean

    mutation: (mutation: Mutation) => void
    redo: () => void
    undo: () => void

    selectGamemode: (gamemode: GamemodeState) => void
}

const createEditorStore = (world: WorldState) =>
    create<WorldStore>((set, get) => ({
        state: {
            world,
            todo: [],
            done: [],
        },
        canUndo: false,
        canRedo: false,
        mutation(mutation: Mutation) {
            mutation.do(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [],
                    done: [...store.state.done, mutation],
                },
                canRedo: false,
                canUndo: true,
            }))
        },
        redo() {
            const last = get().state.todo[get().state.todo.length - 1]
            last.do(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [...store.state.todo.slice(0, store.state.todo.length - 1)],
                    done: [...store.state.done, last],
                },
                canRedo: store.state.todo.length > 1,
                canUndo: true,
            }))
        },
        undo() {
            console.log("undo with remaining done mutations: ", get().state.done.length)

            const last = get().state.done[get().state.done.length - 1]
            last.undo(get().state.world)

            set(store => ({
                state: {
                    world: store.state.world,
                    todo: [...store.state.todo, last],
                    done: [...store.state.done.slice(0, store.state.done.length - 1)],
                },
                canRedo: true,
                canUndo: store.state.done.length > 1,
            }))
        },

        selectGamemode(gamemode: GamemodeState) {
            console.log("select gamemode", gamemode.name)
            set({ gamemode })
        },
    }))

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

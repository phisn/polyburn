import { create } from "zustand"

import { EditorStore, initialState, ModeState, RecursiveMutationWithCapture } from "./EditorStore"
import { Mutation } from "./Mutation"

export const useEditorStore = create<EditorStore>((set, get) => ({
    ...initialState,
    run() {
        set(state => ({ ...state, running: true }))
    },
    stop() {
        set(state => ({ ...state, running: false }))
    },
    mutate(mutation: Mutation | RecursiveMutationWithCapture) {
        if (typeof mutation === "function") {
            get().mutate(mutation(get().world))
            return
        }

        return set(state => ({
            ...state,
            world: {
                ...state.world,
                ...mutation.redo(state.world)
            },
            undos: [...state.undos, mutation],
            redos: []
        }))
    },
    undo() {
        set(state => {
            if (state.undos.length === 0) {
                console.warn("No mutations to undo")
                return state
            }

            const lastMutation = state.undos[state.undos.length - 1]
            return {
                ...state,
                world: {
                    ...state.world,
                    ...lastMutation.undo(state.world)
                },
                undos: state.undos.slice(0, -1),
                redos: [...state.redos, lastMutation]
            }
        })
    },
    redo() {
        set(state => {
            if (state.redos.length === 0) {
                console.warn("No mutations to redo")
                return state
            }

            const lastMutation = state.redos[state.redos.length - 1]
            return {
                ...state,
                world: {
                    ...state.world,
                    ...lastMutation.redo(state.world)
                },
                undos: [...state.undos, lastMutation],
                redos: state.redos.slice(0, -1)
            }
        })
    },
    getModeStateAs<T extends ModeState>(): T {
        return get().modeState as T
    },
    setModeState<T extends ModeState>(modeState: Partial<T>) {
        set(state => ({
            ...state,
            modeState: {
                ...state.modeState,
                ...modeState
            }
        }))
    }
}))

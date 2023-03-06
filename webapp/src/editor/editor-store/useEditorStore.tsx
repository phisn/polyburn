import { create } from "zustand"
import { initialPlacementState } from "../placement/state/PlacementState"
import { Mutation } from "../world/Mutation"
import { World } from "../world/World"
import { EditorStore, initialState, ModeState } from "./EditorStore"
import { Mode } from "./ModeStateBase"

export const useEditorStore = create<EditorStore>((set, get) => ({
    ...initialState,
    mutate(mutation: Mutation | ((world: World) => Mutation)) {
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
                world: lastMutation.undo(state.world),
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
                world: lastMutation.redo(state.world),
                undos: [...state.undos, lastMutation],
                redos: state.redos.slice(0, -1)
            }
        })
    },
    setModeState(modeState: Partial<ModeState>) {
        set(state => ({
            ...state,
            modeState: {
                ...state.modeState,
                ...modeState
            }
        }))
    }
}))
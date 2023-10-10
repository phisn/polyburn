import { enableMapSet, produce } from "immer"
import { StoreApi, UseBoundStore, create } from "zustand"
import { Mutation } from "../runtime-context/mutation"
import { WorldEditModel } from "./edit-models/world-edit-model"

enableMapSet()

export interface EditorStore {
    view: WorldEditModel

    undos: Mutation[]
    redos: Mutation[]

    do: (mutation: Mutation) => void
    undo: () => void
    redo: () => void
}

export type EditorStoreApi = UseBoundStore<StoreApi<EditorStore>>

export const createStore = (view?: WorldEditModel) =>
    create<EditorStore>((set, get) => ({
        view: view ?? {
            gamemodes: [],
            entities: new Map(),
        },

        undos: [],
        redos: [],

        do: mutation => {
            set(state => ({
                view: produce(state.view, mutation.redo),
                undos: [...state.undos, mutation],
                redos: [],
            }))
        },
        undo: () => {
            if (get().undos.length === 0) {
                return
            }

            const last = get().undos[-1]

            set(state => ({
                view: produce(state.view, last.undo),
                undos: state.undos.slice(0, -1),
                redos: [...state.redos, last],
            }))
        },
        redo: () => {
            if (get().redos.length === 0) {
                return
            }

            const last = get().redos[-1]

            set(state => ({
                view: produce(state.view, last.redo),
                undos: [...state.undos, last],
                redos: state.redos.slice(0, -1),
            }))
        },
    }))

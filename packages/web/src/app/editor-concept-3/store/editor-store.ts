import { create } from "zustand"
import { EditorEvent } from "./editor-events/editor-event"

type Listener = (event: EditorEvent) => void

export interface EditorStore {
    selected: number[]
    setSelected: (selected: number[]) => void

    listeners: Listener[]
    addListener(listener: Listener): () => void
}

export const createEditorStore = () =>
    create<EditorStore>(set => ({
        selected: [],
        setSelected: selected => set({ selected }),

        listeners: [],
        addListener: listener => {
            set(state => ({ listeners: [...state.listeners, listener] }))
            return () =>
                set(state => ({
                    listeners: state.listeners.filter(l => l !== listener),
                }))
        },
    }))

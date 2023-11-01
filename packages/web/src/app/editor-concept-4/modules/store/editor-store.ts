import { create } from "zustand"
import { Event } from "../../components/event"

type Listener = (event: Event) => void

export interface EditorStore {
    selected: number[]
    setSelected: (selected: number[]) => void

    listeners: Listener[]
    addListener(listener: Listener): () => void
    publish(event: Event): void
}

export const createEditorStore = () =>
    create<EditorStore>((set, get) => ({
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
        publish: event => {
            get().listeners.forEach(l => l(event))
        },
    }))

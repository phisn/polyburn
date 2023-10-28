import { create } from "zustand"

export interface EditorStore {
    selected: number[]

    select(id: number): void

    unselect(id: number): void
    unselectAll(): void
}

export const createEditorStore = () =>
    create<EditorStore>(set => ({
        selected: [],
        select: id => set(state => ({ selected: [...state.selected, id] })),
        unselect: id =>
            set(state => ({
                selected: state.selected.filter(selectedId => selectedId !== id),
            })),
        unselectAll: () => set({ selected: [] }),
    }))

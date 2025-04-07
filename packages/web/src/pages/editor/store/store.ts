import { Immutable, Patch, produceWithPatches } from "immer"
import { create } from "zustand"
import { EditorWorld } from "./world"

export interface EditorStore {
    highlighted: ReadonlySet<string>
    selected: ReadonlySet<string>

    world: Immutable<EditorWorld>
    worldRedo: WorldChange[]
    worldUndo: WorldChange[]
    updateWorld(f: (world: EditorWorld) => void): void
}

export interface WorldChange {
    redo: Patch[]
    undo: Patch[]
}

export const useEditorStore = create<EditorStore>((set, _get) => ({
    highlighted: new Set(),
    selected: new Set(),

    world: { entities: {} },
    worldRedo: [],
    worldUndo: [],
    updateWorld(f) {
        set(state => {
            const [world, redo, undo] = produceWithPatches(state.world, f)

            const change: WorldChange = {
                redo,
                undo,
            }

            return {
                world,
                worldRedo: [],
                worldUndo: [...state.worldUndo, change],
            }
        })
    },
}))

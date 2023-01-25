import { create } from "zustand";
import { Shape, Vertex, World } from "./World";

interface VisualWorldMods {
    replaceShapeAt?: { index: number, shape: Shape }
    highlightVertices?: Vertex[]
}

export enum EditorModeType {
    Selection,
    Movement,
    Placement,
}

interface EditorState {
    mode: EditorModeType,

    world: World
    worldMods: VisualWorldMods

    undos: World[]
    redos: World[]
}

export interface EditorStore extends EditorState {
    setWorld: (world: World) => void
    undo: () => void
    redo: () => void

    applyVisualMods: (mods: VisualWorldMods) => void
    resetVisualMods: () => void
}

const initialEditorState: EditorState = {
    mode: EditorModeType.Selection,

    world: {
        shapes: [],
    },

    worldMods: {},

    undos: [],
    redos: [],
}

const useEditorStore = create<EditorStore>((set) => ({
    ...initialEditorState,
    setWorld: (world: World) =>
        set((state) => ({
            world: world,
            undos: [...state.undos, state.world],
            redos: [],
        })),
    undo: () =>
        set((state) => {
            console.log(`Undoing ${state.undos.length} undos left`);
            console.log(`later ${state.undos.slice(0, state.undos.length - 1).length} undos left`);

            if (state.undos.length > 0) {
                return {
                    world: state.undos[state.undos.length - 1],
                    undos: state.undos.slice(0, state.undos.length - 1),
                    redos: [...state.redos, state.world],
                };
            }

            return state;
        }),
    redo: () =>
        set((state) => {
            if (state.redos.length > 0) {
                return {
                    world: state.redos[state.redos.length - 1],
                    undos: [...state.undos, state.world],
                    redos: state.redos.slice(0, state.redos.length - 1),
                };
            }

            console.log("No redos left");

            return state;
        }),
    
    applyVisualMods: (mods: VisualWorldMods) => set(() => ({ worldMods: mods })),
    resetVisualMods: () => set(() => ({ worldMods: {} }))
}));

export default useEditorStore;

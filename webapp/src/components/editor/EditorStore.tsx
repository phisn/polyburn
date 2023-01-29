import { create } from "zustand";
import { Shape, Vertex, World } from "./World";
import PIXI from "pixi.js";

interface HighlightedVertex {
    vertex: Vertex
    color: number
}

interface PreviewObject {
    src: string
    position: Vertex
    rotation: number
    anchor: { x: number, y: number }
}

export interface VisualWorldMods {
    replaceShapeAt?: { index: number, shape: Shape }
    highlightVertices?: HighlightedVertex[]
    previewObject?: PreviewObject
}

export enum EditorModeType {
    Selection,
    Movement,
    Placement,
}

interface Mutation {
    undo: (world: World) => World
    redo: (world: World) => World
}

interface EditorState {
    mode: EditorModeType,

    world: World
    worldMods: VisualWorldMods

    undos: Mutation[]
    redos: Mutation[]
}

export interface EditorStore extends EditorState {
    setMode: (mode: EditorModeType) => void

    mutateWorld: (mutation: Mutation) => void
    undo: () => void
    redo: () => void

    applyVisualMods: (mods: VisualWorldMods) => void
    resetVisualMods: () => void
}

const initialEditorState: EditorState = {
    mode: EditorModeType.Placement,

    world: {
        shapes: [],
        objects: [],
    },

    worldMods: {},

    undos: [],
    redos: [],
}

const useEditorStore = create<EditorStore>((set) => ({
    ...initialEditorState,
    setMode: (mode: EditorModeType) => set(() => ({ mode })),
    mutateWorld: (mutation: Mutation) =>
        set((state) => ({
            world: mutation.redo(state.world),
            undos: [...state.undos, mutation],
            redos: [],
        })),
    undo: () =>
        set((state) => {
            if (state.undos.length > 0) {
                const lastUndo = state.undos[state.undos.length - 1];

                return {
                    world: lastUndo.undo(state.world),
                    undos: state.undos.slice(0, state.undos.length - 1),
                    redos: [...state.redos, lastUndo],
                };
            }

            console.log("No undos left");

            return state;
        }),
    redo: () =>
        set((state) => {
            if (state.redos.length > 0) {
                const lastRedo = state.redos[state.redos.length - 1];

                return {
                    world: lastRedo.redo(state.world),
                    undos: [...state.undos, lastRedo],
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

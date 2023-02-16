import { create } from "zustand";
import { ObjectInWorld, Shape, Vertex, World } from "./World";
import PIXI from "pixi.js";

interface HighlightedVertex {
    vertex: Vertex
    color: number
}

interface HighlightedObject {
    index: number
    color: number
}

export interface VisualWorldMods {
    replaceShapeAt?: { index: number, shape: Shape }
    highlightVertices?: HighlightedVertex[]
    highlightObjects?: HighlightedObject[]
    previewObject?: ObjectInWorld & { customAnchor?: Vertex }
}

export enum EditorModeType {
    Editing,
    Playing,
}

export enum EditingModeType {
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
    editingMode: EditingModeType,

    world: World
    worldMods: VisualWorldMods

    undos: Mutation[]
    redos: Mutation[]
}

export interface EditorStore extends EditorState {
    setMode(mode: EditorModeType): void
    setEditingMode: (mode: EditingModeType) => void

    mutateWorld: (mutation: Mutation) => void
    undo: () => void
    redo: () => void

    applyVisualMods: (mods: VisualWorldMods) => void
    resetVisualMods: () => void
}

const initialEditorState: EditorState = {
    mode: EditorModeType.Editing,
    editingMode: EditingModeType.Placement,

    world: JSON.parse("{\"shapes\":[{\"vertices\":[{\"x\":337,\"y\":621},{\"x\":380,\"y\":620},{\"x\":360,\"y\":560},{\"x\":600,\"y\":560},{\"x\":600,\"y\":640},{\"x\":387,\"y\":721}]},{\"vertices\":[{\"x\":900,\"y\":880},{\"x\":840,\"y\":820},{\"x\":780,\"y\":880},{\"x\":660,\"y\":800},{\"x\":700,\"y\":700},{\"x\":920,\"y\":700},{\"x\":940,\"y\":740},{\"x\":1014,\"y\":707},{\"x\":1040,\"y\":800},{\"x\":964,\"y\":807}]},{\"vertices\":[{\"x\":1040,\"y\":300},{\"x\":860,\"y\":300},{\"x\":880,\"y\":220},{\"x\":960,\"y\":240},{\"x\":1080,\"y\":240},{\"x\":1125,\"y\":197},{\"x\":1180,\"y\":220},{\"x\":1240,\"y\":200},{\"x\":1240,\"y\":260},{\"x\":1175,\"y\":297}]},{\"vertices\":[{\"x\":1253,\"y\":532},{\"x\":1353,\"y\":532},{\"x\":1420,\"y\":680},{\"x\":1360,\"y\":820},{\"x\":1440,\"y\":860},{\"x\":1520,\"y\":860},{\"x\":1640,\"y\":820},{\"x\":1580,\"y\":740},{\"x\":1680,\"y\":740},{\"x\":1700,\"y\":640},{\"x\":1820,\"y\":560},{\"x\":1900,\"y\":580},{\"x\":1980,\"y\":580},{\"x\":1900,\"y\":640},{\"x\":1960,\"y\":760},{\"x\":1900,\"y\":760},{\"x\":1860,\"y\":840},{\"x\":1840,\"y\":740},{\"x\":1780,\"y\":700},{\"x\":1720,\"y\":880},{\"x\":1440,\"y\":940},{\"x\":1280,\"y\":900},{\"x\":1303,\"y\":632}]},{\"vertices\":[{\"x\":932,\"y\":1110},{\"x\":1020,\"y\":1140},{\"x\":1080,\"y\":1080},{\"x\":1180,\"y\":1080},{\"x\":1260,\"y\":1120},{\"x\":1200,\"y\":1180},{\"x\":982,\"y\":1210}]}],\"objects\":[]}"),

    worldMods: {},

    undos: [],
    redos: [],
}

const useEditorStore = create<EditorStore>((set) => ({
    ...initialEditorState,
    setMode: (mode: EditorModeType) => set(state => ({ ...state, mode })),
    setEditingMode: (editingMode: EditingModeType) => set(state => ({ ...state, editingMode })),
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

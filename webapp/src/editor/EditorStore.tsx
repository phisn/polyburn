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

    world: JSON.parse("{\"shapes\":[{\"vertices\":[{\"x\":393,\"y\":396},{\"x\":472,\"y\":266},{\"x\":606,\"y\":506},{\"x\":786,\"y\":612},{\"x\":1039,\"y\":680},{\"x\":887,\"y\":807},{\"x\":526,\"y\":615}]},{\"vertices\":[{\"x\":1226,\"y\":998},{\"x\":1137,\"y\":900},{\"x\":1325,\"y\":854},{\"x\":1530,\"y\":780},{\"x\":1694,\"y\":644},{\"x\":1723,\"y\":758},{\"x\":1489,\"y\":949}]},{\"vertices\":[{\"x\":565,\"y\":993},{\"x\":595,\"y\":919},{\"x\":634,\"y\":962},{\"x\":744,\"y\":972},{\"x\":889,\"y\":1123},{\"x\":1172,\"y\":1192},{\"x\":1058,\"y\":1245},{\"x\":824,\"y\":1186},{\"x\":684,\"y\":1062}]},{\"vertices\":[{\"x\":1252,\"y\":1291},{\"x\":1255,\"y\":1227},{\"x\":1308,\"y\":1284},{\"x\":1355,\"y\":1227},{\"x\":1363,\"y\":1296},{\"x\":1399,\"y\":1292},{\"x\":1438,\"y\":1325},{\"x\":1305,\"y\":1327}]},{\"vertices\":[{\"x\":1399,\"y\":1292},{\"x\":1393,\"y\":1229},{\"x\":1439,\"y\":1280},{\"x\":1479,\"y\":1241},{\"x\":1481,\"y\":1221},{\"x\":1513,\"y\":1230},{\"x\":1476,\"y\":1298},{\"x\":1440,\"y\":1330}]},{\"vertices\":[{\"x\":1847,\"y\":472},{\"x\":1707,\"y\":378},{\"x\":1988,\"y\":299},{\"x\":2186,\"y\":146},{\"x\":2201,\"y\":243},{\"x\":2151,\"y\":343}]},{\"vertices\":[{\"x\":4,\"y\":193},{\"x\":12,\"y\":113},{\"x\":171,\"y\":286},{\"x\":106,\"y\":382},{\"x\":62,\"y\":213}]},{\"vertices\":[{\"x\":188,\"y\":352},{\"x\":279,\"y\":339},{\"x\":313,\"y\":250},{\"x\":332,\"y\":328},{\"x\":282,\"y\":428}]},{\"vertices\":[{\"x\":59,\"y\":455},{\"x\":61,\"y\":375},{\"x\":87,\"y\":420},{\"x\":195,\"y\":455},{\"x\":137,\"y\":520}]},{\"vertices\":[{\"x\":212,\"y\":557},{\"x\":262,\"y\":536},{\"x\":304,\"y\":463},{\"x\":314,\"y\":521},{\"x\":264,\"y\":621}]},{\"vertices\":[{\"x\":23,\"y\":743},{\"x\":46,\"y\":716},{\"x\":112,\"y\":774},{\"x\":555,\"y\":892},{\"x\":370,\"y\":934},{\"x\":127,\"y\":871}]}],\"objects\":[{\"placeable\":{\"src\":\"/src/assets/rocket.svg\",\"type\":\"Rocket\",\"anchor\":{\"x\":0.5,\"y\":1},\"size\":{\"width\":300,\"height\":600},\"scale\":0.15,\"className\":\"h-12\"},\"position\":{\"x\":541,\"y\":216},\"rotation\":0},{\"placeable\":{\"src\":\"/src/assets/rocket.svg\",\"type\":\"Rocket\",\"anchor\":{\"x\":0.5,\"y\":1},\"size\":{\"width\":300,\"height\":600},\"scale\":0.15,\"className\":\"h-12\"},\"position\":{\"x\":1626,\"y\":63},\"rotation\":0},{\"placeable\":{\"src\":\"/src/assets/rocket.svg\",\"type\":\"Rocket\",\"anchor\":{\"x\":0.5,\"y\":1},\"size\":{\"width\":300,\"height\":600},\"scale\":0.15,\"className\":\"h-12\"},\"position\":{\"x\":1629,\"y\":517},\"rotation\":0},{\"placeable\":{\"src\":\"/src/assets/rocket.svg\",\"type\":\"Rocket\",\"anchor\":{\"x\":0.5,\"y\":1},\"size\":{\"width\":300,\"height\":600},\"scale\":0.15,\"className\":\"h-12\"},\"position\":{\"x\":2127,\"y\":118},\"rotation\":0},{\"placeable\":{\"src\":\"/src/assets/rocket.svg\",\"type\":\"Rocket\",\"anchor\":{\"x\":0.5,\"y\":1},\"size\":{\"width\":300,\"height\":600},\"scale\":0.15,\"className\":\"h-12\"},\"position\":{\"x\":47,\"y\":132},\"rotation\":0}]}"),

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

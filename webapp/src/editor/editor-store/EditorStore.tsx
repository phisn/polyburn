import { World } from "../../model/world/World"
import { initialPlacementState, PlacementState as PlacementModeState } from "../placement/state/PlacementModeState"
import { Mutation } from "./Mutation"

export type ModeState = PlacementModeState

interface CameraState {
    position: { x: number, y: number }
    zoom: number
}

export interface EditorState {
    running: boolean

    modeState: ModeState

    cameraState: CameraState
    world: World,

    undos: Mutation[],
    redos: Mutation[],
}

// captures work by using a function that returns a mutation. Because after captures we maybe
// want to delegate to another function wants to create a new capture we need to recursively
// call the function until we get a mutation
export type RecursiveMutationWithCapture = (world: World) => RecursiveMutationWithCapture | Mutation

export interface EditorStore extends EditorState {
    run(): void
    stop(): void

    mutate(mutation: Mutation | RecursiveMutationWithCapture): void
    undo(): void
    redo(): void

    setModeState(modeState: Partial<ModeState>): void
}

export const initialState: EditorState = {
    running: false,

    modeState: initialPlacementState,

    cameraState: {
        position: { x: 0, y: 0 },
        zoom: 1
    },
    world: {
        entities: [],
        shapes: []
    },

    undos: [],
    redos: []
}

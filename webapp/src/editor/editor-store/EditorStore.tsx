import { create } from "zustand"
import { Mutation } from "../world/Mutation"
import { World } from "../world/World"
import { initialPlacementState, PlacementState } from "../placement/state/PlacementState"
import { Mode } from "./ModeStateBase"

interface EventHandlers {
    onKeyDown: (keyEvent: KeyboardEvent) => void
    onKeyUp: (keyEvent: KeyboardEvent) => void

    onClick: (mouseEvent: MouseEvent) => void

    onMouseMove: (mouseEvent: MouseEvent) => void
    onMouseDown: (mouseEvent: MouseEvent) => void
    onMouseUp: (mouseEvent: MouseEvent) => void
}

export type ModeState = PlacementState

interface CameraState {
    position: { x: number, y: number }
    zoom: number
}

export interface EditorState {
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
    mutate(mutation: Mutation | RecursiveMutationWithCapture): void
    undo(): void
    redo(): void

    setModeState(modeState: Partial<ModeState>): void
}

export const initialState: EditorState = {
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

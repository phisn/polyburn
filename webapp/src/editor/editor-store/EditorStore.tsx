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

export interface EditorStore extends EditorState {
    mutate(mutation: Mutation | ((world: World) => Mutation)): void
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

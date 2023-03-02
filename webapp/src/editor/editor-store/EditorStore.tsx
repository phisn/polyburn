import { create } from "zustand"
import { Mutation } from "../world/Mutation"
import { World } from "../world/World"
import { initialPlacementState, PlacementHint, PlacementState } from "./PlacementState"

interface EventHandlers {
    onKeyDown: (keyEvent: KeyboardEvent) => void
    onKeyUp: (keyEvent: KeyboardEvent) => void

    onClick: (mouseEvent: MouseEvent) => void

    onMouseMove: (mouseEvent: MouseEvent) => void
    onMouseDown: (mouseEvent: MouseEvent) => void
    onMouseUp: (mouseEvent: MouseEvent) => void
}

export enum Mode {
    Placement = "Placement",
} 

export interface ModeStateBase {
    mode: Mode
}

export type ModeState = PlacementState

export interface EditorState {
    modeState: ModeState

    world: World,

    undos: Mutation[],
    redos: Mutation[],
}

export interface EditorStore extends EditorState {
    mutate(mutation: Mutation): void
    undo(): void
    redo(): void

    setModeState(modeState: Partial<ModeState>): void
}

export const initialState: EditorState = {
    modeState: initialPlacementState,

    world: {
        entities: [],
        shapes: []
    },

    undos: [],
    redos: []
}

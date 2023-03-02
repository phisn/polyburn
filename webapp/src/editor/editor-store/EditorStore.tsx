import { create } from "zustand"
import { Mutation } from "../world/Mutation"
import { World } from "../world/World"
import { initialPlacementState, PlacementState } from "../placement/PlacementState"

interface EventHandlers {
    onKeyDown: (keyEvent: KeyboardEvent) => void
    onKeyUp: (keyEvent: KeyboardEvent) => void

    onClick: (mouseEvent: MouseEvent) => void

    onMouseMove: (mouseEvent: MouseEvent) => void
    onMouseDown: (mouseEvent: MouseEvent) => void
    onMouseUp: (mouseEvent: MouseEvent) => void
}

export type ModeState = PlacementState

export interface EditorState {
    modeState: ModeState

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

    world: {
        entities: [],
        shapes: []
    },

    undos: [],
    redos: []
}

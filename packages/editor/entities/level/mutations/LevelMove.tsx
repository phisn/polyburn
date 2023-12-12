import { Point } from "runtime/src/model/point"
import { LevelState } from "../level-state"

export function levelMove(state: LevelState, to: Point, rotation: number) {
    const from = { ...state.position }

    const fromRotation = state.rotation

    return {
        do() {
            state.position = to
            state.rotation = rotation
        },
        undo() {
            state.position = from
            state.rotation = fromRotation
        },
    }
}

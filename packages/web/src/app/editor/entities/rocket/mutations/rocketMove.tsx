import { Point } from "runtime/src/model/Point"
import { RocketState } from "../RocketState"

export function rocketMove(state: RocketState, to: Point, rotation: number) {
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

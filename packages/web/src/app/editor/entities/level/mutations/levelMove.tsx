import { Point } from "runtime/src/model/world/Point"
import { Vector3 } from "three"
import { LevelState } from "../LevelState"

export function levelMove(state: LevelState, to: Point, rotation: number) {
    const from = state.position
    const toAsVector = new Vector3(to.x, to.y)

    const fromRotation = state.rotation

    return {
        do() {
            state.position = toAsVector
            state.rotation = rotation
        },
        undo() {
            state.position = from
            state.rotation = fromRotation
        },
    }
}

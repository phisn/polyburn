import { Point } from "runtime/src/model/world/Point"
import { Vector3 } from "three"
import { RocketState } from "../RocketState"

export function rocketMove(state: RocketState, to: Point, rotation: number) {
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

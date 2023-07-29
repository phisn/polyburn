import { Point } from "runtime/src/model/world/Point"
import { Vector3 } from "three"
import { ShapeState } from "../ShapeState"

export function shapeMove(state: ShapeState, to: Point) {
    const from = state.position
    const toAsVector = new Vector3(to.x, to.y)

    console.warn(`dispatching shapeMove from ${JSON.stringify(from)} to ${JSON.stringify(to)}`)

    return {
        do() {
            console.warn(`doing shapeMove from ${JSON.stringify(from)} to ${JSON.stringify(to)}`)
            state.position = toAsVector
        },
        undo() {
            console.warn(`undoing shapeMove from ${JSON.stringify(from)} to ${JSON.stringify(to)}`)
            state.position = from
        },
    }
}

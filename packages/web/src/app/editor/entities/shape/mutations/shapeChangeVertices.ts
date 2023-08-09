import { ShapeUtils } from "three"
import { Mutation } from "../../../store/EditorStore"
import { ShapeState, ShapeVertex } from "../ShapeState"

export const shapeChangeVertices = (state: ShapeState, newVertices: ShapeVertex[]): Mutation => {
    const previous = state.vertices

    const newVerticesCorrected = ShapeUtils.isClockWise(newVertices.map(v => v.position))
        ? newVertices.reverse()
        : newVertices

    return {
        do() {
            state.vertices = newVerticesCorrected
        },
        undo() {
            state.vertices = previous
        },
    }
}

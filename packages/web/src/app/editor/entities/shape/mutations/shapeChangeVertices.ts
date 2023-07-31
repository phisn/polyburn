import { Mutation } from "../../../store/EditorStore"
import { ShapeState, ShapeVertex } from "../ShapeState"

export const shapeChangeVertices = (state: ShapeState, newVertices: ShapeVertex[]): Mutation => {
    const previous = state.vertices
    return {
        do() {
            state.vertices = newVertices
        },
        undo() {
            state.vertices = previous
        },
    }
}

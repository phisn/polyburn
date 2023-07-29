import { Mutation } from "../../../store/WorldStore"
import { ShapeState } from "../ShapeState"

export const shapeRemoveVertex = (state: ShapeState, vertexIndex: number): Mutation => {
    const vertex = state.vertices[vertexIndex]

    return {
        do() {
            state.vertices.splice(vertexIndex, 1)
        },
        undo() {
            state.vertices[vertexIndex] = vertex
        },
    }
}

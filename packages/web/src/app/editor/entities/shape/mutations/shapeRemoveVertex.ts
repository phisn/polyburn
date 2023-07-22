import { Mutation } from "../../../store/EntityStore"
import { ShapeState } from "../ShapeState"

export const shapeChangeVertices = (
    state: ShapeState,
    vertexIndex: number,
): Mutation => {
    const vertex = state.vertices[vertexIndex]

    return {
        mutates: [state.id],
        removeOrCreate: false,

        do() {
            state.vertices.splice(vertexIndex, 1)
        },
        undo() {
            state.vertices[vertexIndex] = vertex
        },
    }
}

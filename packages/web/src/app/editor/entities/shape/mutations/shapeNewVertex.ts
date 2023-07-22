import { Mutation } from "../../../store/EntityStore"
import { ShapeState, ShapeVertex } from "../ShapeState"

export const shapeChangeVertices = (
    state: ShapeState,
    vertexIndex: number,
    vertex: ShapeVertex,
): Mutation => {
    return {
        mutates: [state.id],
        removeOrCreate: false,

        do() {
            state.vertices[vertexIndex] = vertex
        },
        undo() {
            state.vertices.splice(vertexIndex, 1)
        },
    }
}

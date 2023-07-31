import { Mutation } from "../../../store/EditorStore"
import { ShapeState, ShapeVertex } from "../ShapeState"

export const shapeNewVertex = (
    state: ShapeState,
    vertexIndex: number,
    vertex: ShapeVertex,
): Mutation => ({
    do() {
        state.vertices[vertexIndex] = vertex
    },
    undo() {
        state.vertices.splice(vertexIndex, 1)
    },
})

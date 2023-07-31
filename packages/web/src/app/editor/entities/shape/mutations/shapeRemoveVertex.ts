import { Mutation } from "../../../store/EditorStore"
import { ShapeState } from "../ShapeState"

export const shapeRemoveVertex = (state: ShapeState, vertexIndex: number): Mutation => {
    const vertex = state.vertices[vertexIndex]

    return {
        do(world) {
            const shape = world.entities.get(state.id) as ShapeState
            shape.vertices.splice(vertexIndex, 1)
        },
        undo(world) {
            const shape = world.entities.get(state.id) as ShapeState
            shape.vertices.splice(vertexIndex, 0, vertex)
        },
    }
}

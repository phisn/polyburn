import { Mutation } from "../../../store/EditorStore"
import { ShapeState } from "../ShapeState"

export const shapeRemoveVertex = (state: ShapeState, vertexIndex: number): Mutation => {
    const vertex = state.vertices[vertexIndex]
    const toDelete = state.vertices.length <= 3

    return {
        do(world) {
            const shape = world.entities.get(state.id) as ShapeState

            if (toDelete) {
                world.entities.delete(shape.id)
            } else {
                shape.vertices.splice(vertexIndex, 1)
            }
        },
        undo(world) {
            if (toDelete) {
                world.entities.set(state.id, state)
            } else {
                const shape = world.entities.get(state.id) as ShapeState
                shape.vertices.splice(vertexIndex, 0, vertex)
            }
        },
    }
}

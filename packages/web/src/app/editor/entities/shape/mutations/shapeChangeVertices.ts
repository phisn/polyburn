import { Mutation } from "../../../store/EntityStore"
import { ShapeState, ShapeVertex } from "../ShapeState"

export interface VertexChange {
    vertexIndex: number
    newVertex: ShapeVertex
}

export const shapeChangeVertices = (
    state: ShapeState,
    changes: VertexChange[],
): Mutation => {
    const previous = state.vertices.filter((_, i) =>
        changes.some(c => c.vertexIndex === i),
    )

    return {
        mutates: [state.id],
        removeOrCreate: false,

        do() {
            for (const change of changes) {
                state.vertices[change.vertexIndex] = change.newVertex
            }
        },
        undo() {
            for (const change of changes) {
                state.vertices[change.vertexIndex] =
                    previous[change.vertexIndex]
            }
        },
    }
}

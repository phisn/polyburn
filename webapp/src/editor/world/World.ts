import { Entity } from "./Entity";
import { capture, composeShapeAt, newMutationWithCompose } from "./Mutation";
import { Point } from "./Point";
import { Shape } from "./Shape";

export interface World {
    shapes: Shape[]
    entities: Entity[]
}

export const insertShape = (shape: Shape) => newMutationWithCompose(
    world => world.shapes.slice(0, world.shapes.length - 1),
    world => [...world.shapes, shape],
    shapes => ({ shapes }),
)

export const removeShape = (shape: Shape) => newMutationWithCompose(
    world => [...world.shapes, shape],
    world => world.shapes.filter(s => s !== shape),
    shapes => ({ shapes }),
)

export const changeVertices = (
    index: number, 
    undo: (vertices: Point[]) => Point[],
    redo: (vertices: Point[]) => Point[],
) => newMutationWithCompose(
    world => undo(world.shapes[index].vertices),
    world => redo(world.shapes[index].vertices),
    (vertices, world) => composeShapeAt(index)({ vertices }, world),
)

export const insertVertex = (shapeIndex: number, insertAfterVertex: number, vertex: Point) => changeVertices(
    shapeIndex,
    vertices => vertices.filter((_, i) => i !== insertAfterVertex + 1),
    vertices => [
        ...vertices.slice(0, insertAfterVertex + 1),
        vertex,
        ...vertices.slice(insertAfterVertex + 1),
    ]
)

export const removeVertex = (shapeIndex: number, vertexIndex: number) => capture(
    world => world.shapes[shapeIndex].vertices[vertexIndex],
    vertex => changeVertices(
        shapeIndex,
        vertices => [
            ...vertices.slice(0, vertexIndex),
            vertex,
            ...vertices.slice(vertexIndex + 1),
        ],
        vertices => [
            ...vertices.slice(0, vertexIndex),
            ...vertices.slice(vertexIndex + 1),
        ]
    )
)

export const moveVertex = (shapeIndex: number, vertexIndex: number, to: Point) => capture(
    world => world.shapes[shapeIndex].vertices[vertexIndex],
    vertex => changeVertices(
        shapeIndex,
        vertices => [
            ...vertices.slice(0, vertexIndex),
            vertex,
            ...vertices.slice(vertexIndex + 1),
        ],
        vertices => [
            ...vertices.slice(0, vertexIndex),
            to,
            ...vertices.slice(vertexIndex + 1),
        ]
    )
)

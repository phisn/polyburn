
import { Entity } from "../../model/world/Entity"
import { Point } from "../../model/world/Point"
import { Shape } from "../../model/world/Shape"
import { capture, composeShapeAt, newMutationWithCompose } from "./Mutation"

export const insertShape = (shape: Shape) => newMutationWithCompose(
    world => world.shapes.slice(0, world.shapes.length - 1),
    world => [...world.shapes, shape],
    shapes => ({ shapes }),
)

export const removeShape = (shapeIndex: number) => capture(
    world => world.shapes[shapeIndex],
    shape => newMutationWithCompose(
        world => [...world.shapes, shape],
        world => world.shapes.filter((_, i) => i !== shapeIndex),
        shapes => ({ shapes }),
    )
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
    world => ({
        vertex: world.shapes[shapeIndex].vertices[vertexIndex],
        vertexCount: world.shapes[shapeIndex].vertices.length
    }),
    params => params.vertexCount > 3
        ? changeVertices(
            shapeIndex,
            vertices => [
                ...vertices.slice(0, vertexIndex),
                params.vertex,
                ...vertices.slice(vertexIndex),
            ],
            vertices => [
                ...vertices.slice(0, vertexIndex),
                ...vertices.slice(vertexIndex + 1),
            ]
        )
        : removeShape(shapeIndex)
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

export const insertEntity = (entity: Entity) => newMutationWithCompose(
    world => world.entities.slice(0, world.entities.length - 1),
    world => [...world.entities, entity],
    entities => ({ entities }),
)

export const removeEntity = (entityIndex: number) => capture(
    world => world.entities[entityIndex],
    entity => newMutationWithCompose(
        world => [...world.entities, entity],
        world => world.entities.filter((_, i) => i !== entityIndex),
        entities => ({ entities }),
    )
)

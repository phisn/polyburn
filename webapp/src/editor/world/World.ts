import { Entity } from "./Entity";
import { composeShapeAt, newMutationWithCompose } from "./Mutation";
import { Point } from "./Point";
import { Shape } from "./Shape";

export interface World {
    shapes: Shape[]
    entities: Entity[]
}

export const insertShape = (shape: Shape) => newMutationWithCompose(
    world => world.shapes.filter(s => s !== shape),
    world => [...world.shapes, shape],
    shapes => ({ shapes }),
)

export const removeShape = (shape: Shape) => newMutationWithCompose(
    world => [...world.shapes, shape],
    world => world.shapes.filter(s => s !== shape),
    shapes => ({ shapes }),
)

export const changeVertices = (index: number, mutation: (vertices: Point[]) => Point[]) => newMutationWithCompose(
    world => mutation(world.shapes[index].vertices),
    world => world.shapes[index].vertices,
    (vertices, world) => composeShapeAt(index)({ vertices }, world),
)

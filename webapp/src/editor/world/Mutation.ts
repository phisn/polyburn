
import { Shape } from "./Shape"
import { World } from "./World"

export interface Mutation {
    undo: (world: World) => any
    redo: (world: World) => any
}

export function newMutation(
    undo: (world: World) => Partial<World>, 
    redo: (world: World) => Partial<World>
): Mutation {
    return { undo, redo }
}

export function newMutationWithCompose<T>(
    undo: (world: World) => T,
    redo: (world: World) => T, 
    compose: (x: T, world: World) => Partial<World>
): Mutation {
    return {
        undo: world => compose(undo(world), world),
        redo: world => compose(redo(world), world),
    }
}

export function composeArrayAt<T>(index: number) {
    return (x: Partial<T>, a: T[]) => [
        ...a.slice(0, index),
        { ...a[index], ...x },
        ...a.slice(index + 1)
    ]
}

export function composeShapeAt(index: number) {
    return (shape: Partial<Shape>, world: World) => ({
        shapes: composeArrayAt<Shape>(index)(shape, world.shapes)
    })
}

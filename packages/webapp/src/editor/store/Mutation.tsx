
import { EntityModel } from "../../model/world/EntityModel"
import { ShapeModel } from "../../model/world/ShapeModel"
import { WorldModel } from "../../model/world/WorldModel"
import { RecursiveMutationWithCapture } from "./EditorStore"

export interface Mutation {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    undo: (world: WorldModel) => any
    redo: (world: WorldModel) => any
}

export function newMutation(
    undo: (world: WorldModel) => Partial<WorldModel>, 
    redo: (world: WorldModel) => Partial<WorldModel>
): Mutation {
    return { undo, redo }
}

export function newMutationWithCompose<T>(
    undo: (world: WorldModel) => T,
    redo: (world: WorldModel) => T, 
    compose: (x: T, world: WorldModel) => Partial<WorldModel>
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
    return (shape: Partial<ShapeModel>, world: WorldModel) => ({
        shapes: composeArrayAt<ShapeModel>(index)(shape, world.shapes)
    })
}

export function composeEntityAt(index: number) {
    return (entity: Partial<EntityModel>, world: WorldModel) => ({
        entities: composeArrayAt<EntityModel>(index)(entity, world.entities)
    })
}

export function capture<T>(
    captureFunc: (world: WorldModel) => T, 
    f: (x: T) => RecursiveMutationWithCapture | Mutation
) {
    return (world: WorldModel) => f(captureFunc(world))
}

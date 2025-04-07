import { ShapeVertex, Size, Transform } from "game/src/model/utils"
import { Immutable } from "immer"

export interface EditorWorld {
    entities: Record<string, EditorEntity>
}

export const EditorWorld = {
    *entitiesWith<T extends (keyof EditorEntity)[]>(
        world: Immutable<EditorWorld>,
        ...keys: T
    ): Generator<[string, Required<Pick<EditorEntity, T[number]>> & EditorEntity]> {
        for (const key in world.entities) {
            const entity = world.entities[key]

            if (keys.every(key => key in entity)) {
                yield [key, entity as any]
            }
        }
    },
}

export type EditorEntity = EditorFlag | EditorRocket | EditorShape

export interface EditorFlag {
    type: "flag"

    size: Size
    transform: Transform
}

export interface EditorRocket {
    type: "rocket"

    size: Size
    transform: Transform
}

export interface EditorShape {
    type: "shape"

    transform: Transform
    vertices: ShapeVertex[]
}

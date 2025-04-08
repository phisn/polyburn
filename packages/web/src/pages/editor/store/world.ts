import { Rect, ShapeVertex, Size, Transform } from "game/src/model/utils"
import { Immutable } from "immer"
import { z } from "zod"

export type EditorFlag = z.infer<typeof EditorFlag>
export const EditorFlag = z.object({
    type: z.literal("flag"),

    bounds: Rect,
    size: Size,
    transform: Transform,
})

export type EditorRocket = z.infer<typeof EditorRocket>
export const EditorRocket = z.object({
    type: z.literal("rocket"),

    size: Size,
    transform: Transform,
})

export type EditorShape = z.infer<typeof EditorShape>
export const EditorShape = z.object({
    type: z.literal("shape"),
    transform: Transform,
    vertices: z.array(ShapeVertex),
})

export type EditorEntity = z.infer<typeof EditorEntity>
export const EditorEntity = z.discriminatedUnion("type", [EditorFlag, EditorRocket, EditorShape])

export type EditorWorld = z.infer<typeof EditorWorld>
export const EditorWorld = z.object({
    entities: z.record(z.string(), EditorEntity),
})

export function* entitiesWith<T extends (keyof EntityComponents)[]>(
    world: Immutable<EditorWorld>,
    ...keys: T
): Generator<[string, EditorEntityWith<T[number]> & EditorEntity]> {
    for (const key in world.entities) {
        const entity = world.entities[key]

        if (keys.every(key => key in entity)) {
            yield [key, entity as any]
        }
    }
}

export type EditorEntityWith<T extends keyof EntityComponents> = Required<
    Pick<EntityComponents, T>
> &
    EditorEntity

export type EntityComponents = UnionToIntersectionWithout<EditorEntity, "type">

type UnionToIntersectionWithout<T, K extends keyof any> = (
    T extends any ? (x: Omit<T, K>) => void : never
) extends (x: infer R) => void
    ? R
    : never

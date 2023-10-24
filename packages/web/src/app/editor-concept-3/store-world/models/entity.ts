import { Immutable } from "immer"
import { NarrowProperties } from "runtime-framework"
import { EditorComponents } from "./editor-components"

interface BaseEntity {
    readonly id: number
}

export type Entity<Components extends object = EditorComponents> = BaseEntity & {
    [K in keyof Components]: Components[K]
}

export type EntityWith<T extends keyof EditorComponents> = Entity<
    NarrowProperties<EditorComponents, T>
>

export type ImmutableEntity<Components extends object = EditorComponents> = Immutable<
    Entity<Components>
>

export type ImmutableEntityWith<T extends keyof EditorComponents> = Immutable<EntityWith<T>>

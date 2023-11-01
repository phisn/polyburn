import { Immutable } from "immer"
import { NarrowProperties } from "runtime-framework"
import { EntityComponents } from "./entity-components"

interface BaseEntity {
    readonly id: number
}

export type Entity<Components extends object = EntityComponents> = BaseEntity & {
    [K in keyof Components]: Components[K]
}

export type EntityWith<T extends keyof EntityComponents> = Entity<
    NarrowProperties<EntityComponents, T>
>

export type ImmutableEntity<Components extends object = EntityComponents> = Immutable<
    Entity<Components>
>

export type ImmutableEntityWith<T extends keyof EntityComponents> = Immutable<EntityWith<T>>

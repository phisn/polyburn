import { Immutable } from "immer"
import { EntityBehaviors } from "./entity-behaviors"

interface BaseEntity {
    readonly id: number
}

export type NarrowProperties<Properties extends object, NarrowTo extends keyof Properties> = {
    [K in NarrowTo]-?: Properties[K]
} & Properties

export type Entity<Behaviors extends object = EntityBehaviors> = BaseEntity & {
    [K in keyof Behaviors]: Behaviors[K]
}

export type EntityWith<T extends keyof EntityBehaviors> = Entity<
    NarrowProperties<EntityBehaviors, T>
>

export type ImmutableEntity<Behaviors extends object = EntityBehaviors> = Immutable<
    Entity<Behaviors>
>

export type ImmutableEntityWith<T extends keyof EntityBehaviors> = Immutable<EntityWith<T>>

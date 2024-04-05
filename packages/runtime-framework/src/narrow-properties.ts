import { Entity } from "./entity"
import { EntitySet } from "./entity-set"

export type NarrowProperties<Properties extends object, NarrowTo extends keyof Properties> = {
    [K in NarrowTo]-?: Properties[K]
} & Properties

export type EntityWith<Components extends object, NarrowTo extends keyof Components> = Entity<
    NarrowProperties<Components, NarrowTo>
>

export type EntitySetWith<Components extends object, NarrowTo extends keyof Components> = EntitySet<
    NarrowProperties<Components, NarrowTo>
>

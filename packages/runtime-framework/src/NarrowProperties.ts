import { Entity } from "./Entity"

export type NarrowProperties<
    Properties extends object,
    NarrowTo extends keyof Properties,
> = {
    [K in NarrowTo]-?: Properties[K]
} & Properties

export type EntityWith<
    Components extends object,
    NarrowTo extends keyof Components,
> = Entity<NarrowProperties<Components, NarrowTo>>

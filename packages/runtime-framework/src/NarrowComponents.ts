import { Entity } from "./Entity"

export type NarrowComponents<Components extends object, NarrowTo extends keyof Components> =
    { [K in NarrowTo]-?: Components[K] } & Components

export type EntityWith<Components extends object, NarrowTo extends keyof Components> =
    Entity<NarrowComponents<Components, NarrowTo>>
    

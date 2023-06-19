import { NarrowComponents } from "./NarrowComponents"

export type EntityId = number

export interface Entity<Components extends object> {
    get components(): Components
    get id(): EntityId

    has<T extends (keyof Components)[]>(...components: [...T]): this is Entity<NarrowComponents<Components, typeof components[number]>>
}

export type EmptyComponent = Record<string, never>

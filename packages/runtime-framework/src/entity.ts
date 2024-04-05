import { NarrowProperties } from "./narrow-properties"

export type EntityId = number

type RequiredFieldsOnly<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
}

export interface Entity<Components extends object> {
    get components(): Components
    get id(): EntityId

    has<T extends (keyof Components)[]>(
        ...components: [...T]
    ): this is Entity<NarrowProperties<Components, (typeof components)[number]>>
    extend<T>(): this is Entity<Components & T>
    with<T extends Partial<Components>>(components: T): Entity<Components & RequiredFieldsOnly<T>>

    toString(): string
}

export type EmptyComponent = Record<string, never>

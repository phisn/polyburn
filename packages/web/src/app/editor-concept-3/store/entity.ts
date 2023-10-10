import { NarrowProperties } from "runtime-framework"
import { EntityComponents } from "./model-entities/entity-components"

export type Immutable<T> = { readonly [K in keyof T]: Immutable<T[K]> }

interface BaseEntity {
    readonly id: number
}

export type Entity<Components extends object = EntityComponents> = BaseEntity & {
    [K in keyof Components]: Components[K]
}

export type ImmutableEntity<Components extends object = EntityComponents> = Immutable<
    Entity<Components>
>

export function entityHas<Components extends object, T extends (keyof Components)[]>(
    entity: Entity<Components>,
    ...componentNames: T
): entity is Entity<NarrowProperties<Components, T[number]>> {
    for (const componentName of componentNames) {
        if (entity[componentName] === undefined) {
            return false
        }
    }

    return true
}

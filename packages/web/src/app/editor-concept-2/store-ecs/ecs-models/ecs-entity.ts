import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/point"

type ImmutablePrimitive = undefined | null | boolean | string | number

export type Immutable<T> = T extends ImmutablePrimitive
    ? T
    : T extends Array<infer U>
    ? ImmutableArray<U>
    : T extends Map<infer K, infer V>
    ? ImmutableMap<K, V>
    : T extends Set<infer M>
    ? ImmutableSet<M>
    : ImmutableObject<T>

export type ImmutableArray<T> = ReadonlyArray<Immutable<T>>
export type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>
export type ImmutableSet<T> = ReadonlySet<Immutable<T>>
export type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> }

interface AbstractEcsEntity<Components> {
    type: EntityType
    id: number
    group: string | undefined

    components: Immutable<{
        [K in keyof Components]: Components[K]
    }>
}

interface Components {
    object?: ObjectComponent
    test?: { value: number }
}

export type EcsEntity = AbstractEcsEntity<Components>

export interface ObjectComponent {
    position: Point
    rotation: number
}

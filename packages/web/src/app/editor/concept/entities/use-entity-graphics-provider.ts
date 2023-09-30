import { useEffect, useRef } from "react"
import { EntityWith } from "runtime-framework"

/*
// Given

interface A {
    ref: RefObject<{ a1: number }>
}

interface B {
    ref: RefObject<{ b1: number, b2: number }>
}

interface Target {
    a: A
    b: B
}

// we should get
//   InferRefProperties<Target> = { a: { a1: number }, b: { b1: number, b2: number } }
// and
//   UnionInferRefProperties<Target> = { a1: number } & { b1: number, b2: number }
*/

type InferRefProperties<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K] extends {
        graphics?: infer R
    }
        ? R
        : never
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never

type UnionInferRefProperties<T> = UnionToIntersection<
    InferRefProperties<T>[keyof InferRefProperties<T>]
>

type EntityUnionComponentRef<C extends object, T extends keyof C> = UnionInferRefProperties<
    EntityWith<C, T>["components"]
>

export function useEntityGraphicsProvider<C extends object, T extends keyof C>(
    entity: EntityWith<C, T>,
    accessor: () => EntityUnionComponentRef<C, T>,
) {
    const ref = useRef<EntityUnionComponentRef<C, T>>()

    useEffect(() => {}, [])
}

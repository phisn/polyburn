import { Draft } from "immer"
import { Entity } from "./models/entity"

export type Mutation<Components extends object> = (
    draft: Draft<Map<number, Entity<Components>>>,
) => void

export function combineMutations<Components extends object>(
    mutations: Mutation<Components>[],
): Mutation<Components> {
    return draft => mutations.forEach(mutation => mutation(draft))
}

import { Draft } from "immer"
import { WorldEditModel } from "./edit-models/world-edit-model"

export type Mutation = {
    undo: (store: Draft<WorldEditModel>) => void
    redo: (store: Draft<WorldEditModel>) => void
}

export function combineMutations(...mutations: Mutation[]): Mutation {
    return {
        undo: store => mutations.forEach(mutation => mutation.undo(store)),
        redo: store => mutations.forEach(mutation => mutation.redo(store)),
    }
}

export function combineMutationsFactories(...mutations: Mutation[]): Mutation {
    return {
        undo: store => mutations.forEach(mutation => mutation.undo(store)),
        redo: store => mutations.forEach(mutation => mutation.redo(store)),
    }
}

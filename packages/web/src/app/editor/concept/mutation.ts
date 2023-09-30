import { EntityStore } from "runtime-framework"
import { EditorComponents } from "./editor-framework-base"

export type Mutation = {
    undo: (store: EntityStore<EditorComponents>) => void
    redo: (store: EntityStore<EditorComponents>) => void
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

export interface MutationDispatcher {
    dispatch(mutation: Mutation): void
}

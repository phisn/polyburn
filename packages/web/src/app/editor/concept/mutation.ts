import { EntityStore } from "runtime-framework"
import { EditorComponents } from "./editor-components"

export type Mutation = (store: EntityStore<EditorComponents>) => void

export interface MutationDispatcher {
    dispatchMutation(mutation: Mutation): void
}

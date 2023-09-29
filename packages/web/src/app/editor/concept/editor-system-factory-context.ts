import { EntityStore } from "runtime-framework"
import { EditorComponents } from "./editor-components"

export interface EditorSystemFactoryContext {
    store: EntityStore<EditorComponents>
}

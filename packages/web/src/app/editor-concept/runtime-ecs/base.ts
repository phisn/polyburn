import { EmptyComponent, EntityStore, SystemFactory } from "runtime-framework"
import { EntityType } from "runtime/proto/world"
import { EditorEvent } from "../../editor/EventHandler"
import { ConsumeEvent } from "../../editor/store/EventStore"
import { CursorManager } from "../runtime-context/cursor"
import { MutationDispatcher } from "../runtime-context/mutation"
import { ObjectComponents } from "./object/object"
import { ShapeComponents } from "./shape/shape"

interface EditorSystemContext {
    event: EditorEvent
}

interface EditorSystemFactoryContext {
    store: EntityStore<EditorComponents>
    mutation: MutationDispatcher
    cursor: CursorManager
}

type EditorSystemReturn = void | typeof ConsumeEvent

export type EditorSystemFactory = SystemFactory<
    EditorSystemFactoryContext,
    EditorSystemContext,
    EditorSystemReturn
>

export type EditorComponents = {
    selected?: EmptyComponent
    type?: EntityType
} & ObjectComponents &
    ShapeComponents

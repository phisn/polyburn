import { EmptyComponent, EntityStore, SystemFactory } from "runtime-framework"
import { EntityType } from "runtime/proto/world"
import { EditorEvent } from "../EventHandler"
import { ConsumeEvent } from "../store/EventStore"
import { CursorManager } from "./cursor"
import { ObjectComponents } from "./features/object/object"
import { ShapeComponents } from "./features/shape/shape"
import { MutationDispatcher } from "./mutation"

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

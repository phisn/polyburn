import { SystemFactory } from "runtime-framework"
import { ConsumeEvent } from "../store/EventStore"
import { EditorSystemContext } from "./editor-system-context"
import { EditorSystemFactoryContext } from "./editor-system-factory-context"

export type EditorSystemReturn = void | typeof ConsumeEvent

export type EditorSystemFactory = SystemFactory<
    EditorSystemFactoryContext,
    EditorSystemContext,
    EditorSystemReturn
>

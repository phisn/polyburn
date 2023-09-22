import { SystemFactory } from "runtime-framework/src/system-factory"
import { RuntimeComponents } from "./runtime-components"
import { RuntimeFactoryContext } from "./runtime-factory-context"
import { RuntimeSystemContext } from "./runtime-system-stack"

export type RuntimeSystemFactory = SystemFactory<
    RuntimeFactoryContext<RuntimeComponents>,
    RuntimeSystemContext
>

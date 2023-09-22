import { SystemStack } from "runtime-framework"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { WebappFactoryContext } from "./webapp-factory-context"

export type WebappSystemStack = SystemStack<WebappFactoryContext, RuntimeSystemContext>

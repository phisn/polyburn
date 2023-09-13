import { SystemStack } from "runtime-framework"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { WebappFactoryContext } from "./WebappFactoryContext"

export type WebappSystemStack = SystemStack<WebappFactoryContext, RuntimeSystemContext>

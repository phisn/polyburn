import { SystemFactory } from "runtime-framework/src/system-factory"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { WebappFactoryContext } from "./webapp-factory-context"

export type WebappSystemFactory = SystemFactory<WebappFactoryContext, RuntimeSystemContext>

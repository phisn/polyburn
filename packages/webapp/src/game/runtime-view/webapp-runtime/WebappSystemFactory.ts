
import { RuntimeFactoryContext } from "runtime/src/core/RuntimeFactoryContext"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { SystemFactory } from "runtime-framework/src/SystemFactory"

import { WebappComponents } from "./WebappComponents"

export type WebappSystemFactory = SystemFactory<RuntimeFactoryContext<WebappComponents>, RuntimeSystemContext>

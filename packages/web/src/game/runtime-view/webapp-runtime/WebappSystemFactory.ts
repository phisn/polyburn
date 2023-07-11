import { SystemFactory } from "runtime-framework/src/SystemFactory"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"

import { WebappFactoryContext } from "./WebappFactoryContext"

export type WebappSystemFactory = SystemFactory<
    WebappFactoryContext,
    RuntimeSystemContext
>

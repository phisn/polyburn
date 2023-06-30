
import { Meta } from "runtime/src/core/common/Meta"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { SystemFactory } from "runtime-framework/src/SystemFactory"

import { WebappComponents } from "./WebappComponents"

export type WebappSystemFactory = SystemFactory<WebappComponents, Meta, RuntimeSystemContext>

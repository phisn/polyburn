import { SystemFactory } from "runtime-framework/src/SystemFactory"

import { Meta } from "./common/Meta"
import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeSystemContext } from "./RuntimeSystemStack"

export type RuntimeSystemFactory = SystemFactory<RuntimeComponents, Meta, RuntimeSystemContext>

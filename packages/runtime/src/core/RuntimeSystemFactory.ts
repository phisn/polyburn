import { SystemFactory } from "packages/runtime-framework/src/SystemFactory"

import { Meta } from "./Meta"
import { RuntimeSystemContext } from "./RuntimeSystemStack"

export type RuntimeSystemFactory = SystemFactory<Meta, RuntimeSystemContext>

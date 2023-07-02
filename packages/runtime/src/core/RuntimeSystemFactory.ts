import { SystemFactory } from "runtime-framework/src/SystemFactory"

import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeFactoryContext } from "./RuntimeFactoryContext"
import { RuntimeSystemContext } from "./RuntimeSystemStack"

export type RuntimeSystemFactory = SystemFactory<RuntimeFactoryContext<RuntimeComponents>, RuntimeSystemContext>

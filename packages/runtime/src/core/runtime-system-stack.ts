import { SystemStack } from "runtime-framework"

import { RuntimeComponents } from "./runtime-components"
import { RuntimeFactoryContext } from "./runtime-factory-context"

export interface RuntimeSystemContext {
    rotation: number
    thrust: boolean
}

export type RuntimeSystemStack = SystemStack<
    RuntimeFactoryContext<RuntimeComponents>,
    RuntimeSystemContext
>

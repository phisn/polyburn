import { SystemStack } from "runtime-framework"

import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeFactoryContext } from "./RuntimeFactoryContext"

export interface RuntimeSystemContext {
    rotation: number
    thrust: boolean
}

export type RuntimeSystemStack = SystemStack<RuntimeFactoryContext<RuntimeComponents>, RuntimeSystemContext>

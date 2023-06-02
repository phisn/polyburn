import { SystemStack } from "runtime-framework"

import { Meta } from "./Meta"

export interface RuntimeSystemContext {
    rotation: number
    thrust: boolean
}

export type RuntimeSystemStack = SystemStack<Meta, RuntimeSystemContext>

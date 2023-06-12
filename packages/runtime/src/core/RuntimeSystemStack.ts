import { SystemStack } from "../../../runtime-framework/src"
import { Meta } from "./Meta"
import { RuntimeComponents } from "./RuntimeComponents"

export interface RuntimeSystemContext {
    rotation: number
    thrust: boolean
}

export type RuntimeSystemStack = SystemStack<RuntimeComponents, Meta, RuntimeSystemContext>

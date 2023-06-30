import { SystemStack } from "../../../runtime-framework/src"
import { Meta } from "./common/Meta"
import { RuntimeComponents } from "./RuntimeComponents"

export interface RuntimeSystemContext {
    rotation: number
    thrust: boolean
}

export type RuntimeSystemStack = SystemStack<RuntimeComponents, Meta, RuntimeSystemContext>

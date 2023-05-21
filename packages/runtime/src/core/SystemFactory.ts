import { RuntimeStore } from "runtime-framework"

import { Meta } from "./Meta"
import { SystemContext } from "./SystemContext"

export type SystemFactory = (meta: Meta, store: RuntimeStore<SystemContext>) 
    => (context: SystemContext) 
    => void

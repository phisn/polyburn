import { EntityStore } from "runtime-framework"

import { Meta } from "./Meta"
import { SystemContext } from "./SystemContext"

export type SystemFactory = (meta: Meta, store: EntityStore) 
    => (context: SystemContext) 
    => void

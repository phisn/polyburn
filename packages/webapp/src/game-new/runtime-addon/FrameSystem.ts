import { EntityStore } from "runtime-framework"

import { FrameContext } from "./FrameContext"

// systems that are run every frame
export type FrameSystemFactory = (store: EntityStore) 
    => (context: FrameContext)
    => void

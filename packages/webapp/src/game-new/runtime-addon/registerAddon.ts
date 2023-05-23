import { EntityStore, SystemStack } from "runtime-framework"

import { newInterpolationFrameSystem } from "./interpolation/InterpolationFrameSystem"


export const registerAddon = (store: EntityStore) => {
    
    
    return new SystemStack(
        newInterpolationFrameSystem(store),
    )
}

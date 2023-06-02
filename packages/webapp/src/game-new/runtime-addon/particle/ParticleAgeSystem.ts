import { Meta } from "runtime/src/core/Meta"
import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"
import { EntityStore } from "runtime-framework"

import { AddonComponents } from "../AddonComponents"

export const newParticleAgeSystem: RuntimeSystemFactory = (meta: Meta, store: EntityStore) => {
    const particles = store.getState().newEntitySet(
        AddonComponents.Particle)

    return (context) => {
        void 0
    }
}

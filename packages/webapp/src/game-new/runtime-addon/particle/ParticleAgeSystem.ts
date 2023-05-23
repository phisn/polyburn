import { Meta } from "runtime/src/core/Meta"
import { SystemFactory } from "runtime/src/core/SystemFactory"
import { EntityStore } from "runtime-framework"

import { AddonComponents } from "../AddonComponents"

export const newParticleAgeSystem: SystemFactory = (meta: Meta, store: EntityStore) => {
    const particles = store.getState().newEntitySet(
        AddonComponents.Particle)

    return (context) => {
        void 0
    }
}

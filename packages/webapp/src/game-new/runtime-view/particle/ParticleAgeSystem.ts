import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"

import { AddonComponents } from "../AddonComponents"

export const newParticleAgeSystem: RuntimeSystemFactory = (store) => {
    const particles = store.getState().newEntitySet(
        AddonComponents.Particle)

    return (context) => {
        void 0
    }
}

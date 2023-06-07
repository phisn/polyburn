import { Components } from "runtime/src/core/Components"
import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"

export const newParticleSpawnSystem: RuntimeSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket)

    return (context) => {
        void 0
    }
}

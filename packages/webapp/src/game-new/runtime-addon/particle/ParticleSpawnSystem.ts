import { Components } from "runtime/src/core/Components"
import { Meta } from "runtime/src/core/Meta"
import { SystemFactory } from "runtime/src/core/SystemFactory"
import { EntityStore } from "runtime-framework"

export const newParticleSpawnSystem: SystemFactory = (meta: Meta, store: EntityStore) => {
    const rockets = store.getState().newEntitySet(
        Components.Rocket)

    return (context) => {
        void 0
    }
}

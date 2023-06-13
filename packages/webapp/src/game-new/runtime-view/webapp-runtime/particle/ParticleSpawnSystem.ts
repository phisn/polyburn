import { WebappSystemFactory } from "../WebappSystemFactory"

export const newParticleSpawnSystem: WebappSystemFactory = (store) => {
    const rockets = store.getState().newEntitySet(
        "rocket")

    return (context) => {
        void 0
    }
}

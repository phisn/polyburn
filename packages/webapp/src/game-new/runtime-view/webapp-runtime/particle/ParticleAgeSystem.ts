import { WebappSystemFactory } from "../WebappSystemFactory"

export const newParticleAgeSystem: WebappSystemFactory = (store) => {
    const particles = store.getState().newEntitySet("particle")

    return (context) => {
        void 0
    }
}

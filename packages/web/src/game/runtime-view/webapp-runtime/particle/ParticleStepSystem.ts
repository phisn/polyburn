import { WebappSystemFactory } from "../WebappSystemFactory"

export const newParticleStepSystem: WebappSystemFactory =
    ({ particlePhysics }) =>
    () =>
        particlePhysics.step()

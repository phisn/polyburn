import { WebappSystemFactory } from "../WebappSystemFactory"

export const newParticleStepSystem: WebappSystemFactory = ({ particlePhysics }) => {
    return () => {
        particlePhysics.step()
    }
}

import { WebappSystemFactory } from "../webapp-system-factory"

export const newParticleStepSystem: WebappSystemFactory = ({ particlePhysics }) => {
    return () => {
        particlePhysics.step()
    }
}

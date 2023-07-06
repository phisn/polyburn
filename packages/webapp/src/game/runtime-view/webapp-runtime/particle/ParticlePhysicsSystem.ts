import { WebappSystemFactory } from "../WebappSystemFactory"

export const newParticlePhysicsSystem: WebappSystemFactory = ({ particlePhysics }) =>
    () => particlePhysics.step()

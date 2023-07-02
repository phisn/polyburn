import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"

import { spawnParticles } from "../particle-source/Particle"
import { WebappSystemFactory } from "../WebappSystemFactory"

export const newThrustParticleSpawnSystem: WebappSystemFactory = ({ store, rapier }) => {
    const rockets = store.newSet("particleSource", ...RocketEntityComponents)

    const particlePerFrame = 3 

    return (context) => {
        if (context.thrust) {
            for (const rocket of rockets) {
                spawnParticles(rapier, rocket.components.particleSource, particlePerFrame)
            }
        }
    }
}

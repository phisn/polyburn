import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"

import { spawnParticles } from "../particle-source/Particle"
import { WebappSystemFactory } from "../WebappSystemFactory"

export const newThrustParticleSpawnSystem: WebappSystemFactory = (store, meta) => {
    const rockets = store.newEntitySet("particleSource", ...RocketEntityComponents)

    const particlePerFrame = 4

    return (context) => {
        if (context.thrust) {
            for (const rocket of rockets) {
                spawnParticles(meta, rocket.components.particleSource, particlePerFrame)
            }
        }
    }
}

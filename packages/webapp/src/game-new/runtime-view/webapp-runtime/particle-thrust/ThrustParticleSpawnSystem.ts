import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"

import { newParticle } from "../particle/ParticleFactory"
import { WebappSystemFactory } from "../WebappSystemFactory"
import { newThrustParticleConfiguration } from "./ThrustParticleConfiguration"

export const newThrustParticleSpawnSystem: WebappSystemFactory = (store, meta) => {
    const rockets = store.newEntitySet(...RocketEntityComponents)

    const particlePerFrame = 4

    return (context) => {
        if (context.thrust) {
            for (const rocket of rockets) {
                for (let i = 0; i < particlePerFrame; i++) {
                    newParticle(meta, store, newThrustParticleConfiguration(rocket), i / particlePerFrame)
                }
            }
        }
    }
}

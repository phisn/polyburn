import { RocketEntityComponents } from "runtime/src/core/rocket/rocket-entity"

import { injectParticleSource } from "../particle/inject-particle-source"
import { spawnParticles } from "../particle/particle"
import { newParticleSourceComponent } from "../particle/particle-source"
import { WebappSystemFactory } from "../webapp-system-factory"
import { newThrustParticleFactory } from "./thrust-particle-factory"

export const newThrustParticleSpawnSystem: WebappSystemFactory = ({ store, particlePhysics }) => {
    injectParticleSource(
        store,
        entity => newParticleSourceComponent(300, newThrustParticleFactory(entity)),
        ...RocketEntityComponents,
    )

    const rockets = store.newSet("particleSource", ...RocketEntityComponents)

    const particlePerFrame = 3

    return context => {
        if (context.thrust) {
            for (const rocket of rockets) {
                spawnParticles(particlePhysics, rocket.components.particleSource, particlePerFrame)
            }
            /*
            aggregate += particlePerFrame

            if (aggregate >= 1) {
                const particles = Math.floor(aggregate)

                for (const rocket of rockets) {
                    spawnParticles(
                        particlePhysics,
                        rocket.components.particleSource,
                        particles,
                    )
                }

                aggregate -= particles
            }
            */
        }
    }
}

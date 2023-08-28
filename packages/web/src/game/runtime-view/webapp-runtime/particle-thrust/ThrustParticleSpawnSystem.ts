import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"

import { injectParticleSource } from "../particle/InjectParticleSource"
import { spawnParticles } from "../particle/Particle"
import { newParticleSourceComponent } from "../particle/ParticleSource"
import { WebappSystemFactory } from "../WebappSystemFactory"
import { newThrustParticleFactory } from "./ThrustParticleFactory"

export const newThrustParticleSpawnSystem: WebappSystemFactory = ({ store, particlePhysics }) => {
    injectParticleSource(
        store,
        entity => newParticleSourceComponent(300, newThrustParticleFactory(entity)),
        ...RocketEntityComponents,
    )

    const rockets = store.newSet("particleSource", ...RocketEntityComponents)

    const particlePerFrame = 3
    let aggregate = 0

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

import { WebappSystemFactory } from "../webapp-system-factory"
import { removeParticle } from "./particle"

export const newParticleAgeSystem: WebappSystemFactory = ({ store, particlePhysics }) => {
    const entities = store.newSet("particleSource")

    return () => {
        for (const entity of entities) {
            const particles = entity.components.particleSource.particles

            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i]

                if (particle) {
                    particle.age++

                    if (particle.age >= particle.lifeTime) {
                        removeParticle(particlePhysics, entity.components.particleSource, i)
                    }
                }
            }
        }
    }
}

import { WebappSystemFactory } from "../WebappSystemFactory"
import { removeParticle } from "./Particle"

export const newParticleAgeSystem: WebappSystemFactory = ({ store, rapier }) => {
    const entities = store.newSet("particleSource")

    return () => {
        for (const entity of entities) {
            for (let i = 0; i < entity.components.particleSource.particles.length; i++) {
                const particle = entity.components.particleSource.particles[i]
                
                if (particle) {
                    particle.age++

                    if (particle.age >= particle.lifeTime) {
                        removeParticle(rapier, entity.components.particleSource, i)
                    }
                }

            }
        }
    }
}

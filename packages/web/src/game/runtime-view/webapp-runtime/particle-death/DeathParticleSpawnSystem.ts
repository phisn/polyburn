import { spawnParticles } from "../particle/Particle"
import { newParticleSourceComponent } from "../particle/ParticleSource"
import { WebappSystemFactory } from "../WebappSystemFactory"
import { newDeathParticleFactory } from "./DeathParticleFactory"

export const newDeathParticleSpawnSystem: WebappSystemFactory = ({
    messageStore,
    store,
    particlePhysics,
}) => {
    const deaths = messageStore.collect("rocketDeath")

    return () => {
        for (const death of deaths) {
            const deathSource = store.create({
                particleSource: newParticleSourceComponent(1000, newDeathParticleFactory(death)),
                deathParticleSource: {},
            })

            spawnParticles(particlePhysics, deathSource.components.particleSource, 50)
        }
    }
}

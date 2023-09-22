import { spawnParticles } from "../particle/particle"
import { newParticleSourceComponent } from "../particle/particle-source"
import { WebappSystemFactory } from "../webapp-system-factory"
import { newDeathParticleFactory } from "./death-particle-factory"

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

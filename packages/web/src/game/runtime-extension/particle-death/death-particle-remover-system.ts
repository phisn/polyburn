import { WebappSystemFactory } from "../webapp-system-factory"

export const newDeathParticleRemoverSystem: WebappSystemFactory = ({ store }) => {
    const deathParticleSources = store.newSet("particleSource", "deathParticleSource")

    return () => {
        for (const deathParticleSource of deathParticleSources) {
            if (deathParticleSource.components.particleSource.amount === 0) {
                console.log("removing death particle source")
                store.remove(deathParticleSource.id)
            }
        }
    }
}

import { LevelEntityComponents } from "runtime/src/core/level/LevelEntity"

import { injectParticleSource } from "../particle/InjectParticleSource"
import { spawnParticles } from "../particle/Particle"
import { newParticleSourceComponent } from "../particle/ParticleSource"
import { WebappComponents } from "../WebappComponents"
import { WebappSystemFactory } from "../WebappSystemFactory"
import { newCaptureParticleFactory } from "./CaptureParticleFactory"

export const newCaptureParticleSpawnSystem: WebappSystemFactory = ({ store, messageStore, particlePhysics }) => {
    injectParticleSource(
        store,
        entity => newParticleSourceComponent(
            1000,
            newCaptureParticleFactory(entity)
        ),
        ...LevelEntityComponents)

    const captures = messageStore.collect("levelCaptured")
    
    const particlePerFrame = 20

    return () => {
        for (const capture of captures) {
            if (capture.level.extend<WebappComponents>() && capture.level.has("particleSource")) {
                spawnParticles(particlePhysics, capture.level.components.particleSource, particlePerFrame)
            }
        }
    }
}

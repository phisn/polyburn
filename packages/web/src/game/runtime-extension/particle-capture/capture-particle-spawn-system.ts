import { LevelEntityComponents } from "runtime/src/core/level/level-entity"
import { injectParticleSource } from "../particle/inject-particle-source"
import { spawnParticles } from "../particle/particle"
import { newParticleSourceComponent } from "../particle/particle-source"
import { WebappComponents } from "../webapp-components"
import { WebappSystemFactory } from "../webapp-system-factory"
import { newCaptureParticleFactory } from "./capture-particle-factory"

export const newCaptureParticleSpawnSystem: WebappSystemFactory = ({
    store,
    messageStore,
    particlePhysics,
}) => {
    injectParticleSource(
        store,
        entity => newParticleSourceComponent(1000, newCaptureParticleFactory(entity)),
        ...LevelEntityComponents,
    )

    const captures = messageStore.collect("levelCaptured")

    const particlePerFrame = 40

    return () => {
        for (const capture of captures) {
            if (capture.level.extend<WebappComponents>() && capture.level.has("particleSource")) {
                spawnParticles(
                    particlePhysics,
                    capture.level.components.particleSource,
                    particlePerFrame,
                )
            }
        }
    }
}

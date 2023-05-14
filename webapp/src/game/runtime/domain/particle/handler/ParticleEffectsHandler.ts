import { RuntimeState } from "../../../RuntimeState"
import { StepContext } from "../../../StepContext"

export function handleParticleEffects(
    runtime: RuntimeState,
    context: StepContext
) {
    for (let i = 0; i < runtime.particles.length; i++) {
        const particle = runtime.particles[i]

        if (particle.next()) {
            runtime.particles.splice(i, 1)
            i--
        }
    }
}

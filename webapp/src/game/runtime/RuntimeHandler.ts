import { handleCollisionEvents } from "./handler/handleCollisionEvents"
import { handleParticleEffects } from "./handler/handleParticleEffects"
import { handleRocketCollisions } from "./handler/handleRocketCollisions"
import { handleRocketRotation } from "./handler/handleRocketRotation"
import { handleRocketThrust } from "./handler/handleRocketThrust"
import { RuntimeConfig } from "./RuntimeConfig"
import { RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"

export type RuntimeHandler = (runtime: RuntimeState, context: StepContext) => void

export function getRuntimeHandlers(config: RuntimeConfig): RuntimeHandler[] {
    const runtimeHandlers: RuntimeHandler[] = [
        handleCollisionEvents,
        handleRocketCollisions,
        handleRocketRotation,
        handleRocketThrust,
    ]

    if (config.enableParticles) {
        runtimeHandlers.push(handleParticleEffects)
    }

    return runtimeHandlers
}

/*
import { RuntimeState } from "../RuntimeState"
import { StepContext } from "../StepContext"

export function (runtime: RuntimeState, context: UpdateContext): void {
    
}
*/

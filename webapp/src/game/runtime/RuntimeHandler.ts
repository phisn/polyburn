import { handleCollisionEvents } from "./domain/common/handler/CollisionEventHandler"
import { handleParticleEffects } from "./domain/particle/handler/ParticleEffectsHandler"
import { handleRocketCollisions } from "./domain/rocket/handler/RocketCollisionsHandler"
import { handleRocketRotation } from "./domain/rocket/handler/RocketRotationHandler"
import { handleRocketThrust } from "./domain/rocket/handler/RocketThrustHandler"
import { RuntimeConfig } from "./RuntimeConfig"
import { RuntimeState } from "./RuntimeState"
import { StepContext } from "./StepContext"

export type RuntimeHandler = (runtime: RuntimeState, context: StepContext) => void

export function createCommonRuntimeHandlers(config: RuntimeConfig): RuntimeHandler[] {
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

import RAPIER from "@dimforge/rapier2d-compat"
import { SystemStack } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { newRuntime } from "runtime/src/Runtime"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { defaultConfig } from "../../../../../runtime/src/core/RuntimeConfig"
import { WebappComponents } from "./WebappComponents"
import { WebappFactoryContext } from "./WebappFactoryContext"
import { newRegisterGraphicsSystem } from "./graphic/RegisterGraphicsSystem"
import { newInjectInterpolationSystem } from "./interpolation/InjectInterpolationSystem"
import { newCaptureParticleSpawnSystem } from "./particle-capture-source/CaptureParticleSpawnSystem"
import { newThrustParticleSpawnSystem } from "./particle-thrust-source/ThrustParticleSpawnSystem"
import { newParticleAgeSystem } from "./particle/ParticleAgeSystem"
import { newParticleStepSystem } from "./particle/ParticleStepSystem"

export const newWebappRuntime = (world: WorldModel, gamemode: string) => {
    const { context, stack } = newRuntime<WebappComponents>(world, gamemode)

    const particlePhysics = RAPIER.World.restoreSnapshot(context.physics.takeSnapshot())

    particlePhysics.forEachRigidBody(body => {
        if (body.isFixed() === false) {
            particlePhysics.removeRigidBody(body)
        }
    })

    for (const level of context.store.find("level")) {
        const bounds = level.components.level.boundsCollider.parent()

        if (bounds) {
            particlePhysics.removeRigidBody(bounds)
        }
    }

    const contextExtended: WebappFactoryContext = {
        ...context,
        particlePhysics,
        config: defaultConfig,
    }

    const stackExtended: SystemStack<WebappFactoryContext, RuntimeSystemContext> = stack.extend({
        particlePhysics,
    })

    stackExtended.add(
        newParticleStepSystem,
        newCaptureParticleSpawnSystem,
        newInjectInterpolationSystem,
        newParticleAgeSystem,
        newThrustParticleSpawnSystem,
        newRegisterGraphicsSystem,
    )

    return {
        context: contextExtended,
        stack: stackExtended,
    }
}

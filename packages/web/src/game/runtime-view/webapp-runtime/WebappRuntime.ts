import RAPIER from "@dimforge/rapier2d-compat"
import { SystemStack } from "runtime-framework"
import { newRuntime } from "runtime/src/Runtime"
import { Gamemode } from "runtime/src/gamemode/Gamemode"
import { WorldModel } from "runtime/src/model/world/WorldModel"

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

export const newWebappRuntime = (gamemode: Gamemode, world: WorldModel) => {
    const { context, stack } = newRuntime<WebappComponents>(gamemode, world)

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

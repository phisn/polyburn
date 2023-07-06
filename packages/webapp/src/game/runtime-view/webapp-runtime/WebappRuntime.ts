import RAPIER from "@dimforge/rapier2d-compat"
import { Gamemode } from "runtime/src/gamemode/Gamemode"
import { WorldModel } from "runtime/src/model/world/WorldModel"
import { newRuntime } from "runtime/src/Runtime"
import { SystemStack } from "runtime-framework"

import { RuntimeSystemContext } from "../../../../../runtime/src/core/RuntimeSystemStack"
import { newRegisterGraphicsSystem } from "./graphic/RegisterGraphicsSystem"
import { newInjectInterpolationSystem } from "./interpolation/InjectInterpolationSystem"
import { newParticleAgeSystem } from "./particle/ParticleAgeSystem"
import { newParticlePhysicsSystem } from "./particle/ParticlePhysicsSystem"
import { newCaptureParticleSpawnSystem } from "./particle-capture-source/CaptureParticleSpawnSystem"
import { newThrustParticleSpawnSystem } from "./particle-thrust-source/ThrustParticleSpawnSystem"
import { WebappComponents } from "./WebappComponents"
import { WebappFactoryContext } from "./WebappFactoryContext"

export const newWebappRuntime = (gamemode: Gamemode, world: WorldModel) => {
    const { context, stack } = newRuntime<WebappComponents>(gamemode, world)

    const particlePhysics = RAPIER.World.restoreSnapshot(context.physics.takeSnapshot())

    particlePhysics.forEachRigidBody(body => {
        if (body.isFixed() === false) {
            particlePhysics.removeRigidBody(body)
        }
    })

    const contextExtended: WebappFactoryContext = {
        ...context,
        particlePhysics
    }

    const stackExtended: SystemStack<WebappFactoryContext, RuntimeSystemContext> = stack.extend({
        particlePhysics
    })

    stackExtended.add(
        newParticlePhysicsSystem,
        newCaptureParticleSpawnSystem,
        newInjectInterpolationSystem,
        newParticleAgeSystem,
        newThrustParticleSpawnSystem,
        newRegisterGraphicsSystem,
    )

    return {
        context: contextExtended,
        stack: stackExtended
    }
}
import RAPIER from "@dimforge/rapier2d-compat"
import { SystemStack } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { newRuntime } from "runtime/src/Runtime"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { ReplayCaptureService } from "runtime/src/model/replay/ReplayCaptureService"
import { defaultConfig } from "../../../../../runtime/src/core/RuntimeConfig"
import { WebappComponents } from "./WebappComponents"
import { WebappFactoryContext } from "./WebappFactoryContext"
import { WebappSystemStack } from "./WebappSystemStack"
import { newRegisterGraphicsSystem } from "./graphic/RegisterGraphicsSystem"
import { newInjectInterpolationSystem } from "./interpolation/InjectInterpolationSystem"
import { newCaptureParticleSpawnSystem } from "./particle-capture/CaptureParticleSpawnSystem"
import { newDeathParticleRemoverSystem } from "./particle-death/DeathParticleRemoverSystem"
import { newDeathParticleSpawnSystem } from "./particle-death/DeathParticleSpawnSystem"
import { newThrustParticleSpawnSystem } from "./particle-thrust/ThrustParticleSpawnSystem"
import { newParticleAgeSystem } from "./particle/ParticleAgeSystem"
import { newParticleStepSystem } from "./particle/ParticleStepSystem"

export const newWebappRuntime = (world: WorldModel, gamemode: string): WebappSystemStack => {
    const stack = newRuntime<WebappComponents>(world, gamemode)

    const particlePhysics = RAPIER.World.restoreSnapshot(
        stack.factoryContext.physics.takeSnapshot(),
    )

    particlePhysics.forEachRigidBody(body => {
        if (body.isFixed() === false) {
            particlePhysics.removeRigidBody(body)
        }
    })

    for (const level of stack.factoryContext.store.find("level")) {
        const bounds = level.components.level.boundsCollider.parent()

        if (bounds) {
            particlePhysics.removeRigidBody(bounds)
        }
    }

    const stackExtended: SystemStack<WebappFactoryContext, RuntimeSystemContext> = stack.extend({
        particlePhysics,
        replayCaptureService: new ReplayCaptureService(),
        config: defaultConfig,
    })

    stackExtended.add(
        newParticleStepSystem,
        newCaptureParticleSpawnSystem,
        newInjectInterpolationSystem,
        newParticleAgeSystem,
        newThrustParticleSpawnSystem,
        newRegisterGraphicsSystem,
        newDeathParticleSpawnSystem,
        newDeathParticleRemoverSystem,
    )

    return stackExtended
}

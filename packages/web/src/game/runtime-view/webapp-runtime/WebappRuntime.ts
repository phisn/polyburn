import RAPIER from "@dimforge/rapier2d-compat"
import { SystemStack } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { newRuntime } from "runtime/src/Runtime"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { createShapeRigidBody } from "runtime/src/core/shape/ShapeFactory"
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

export const newWebappRuntime = (
    name: string,
    world: WorldModel,
    gamemode: string,
): WebappSystemStack => {
    const stack = newRuntime<WebappComponents>(world, gamemode)

    const particlePhysics = new RAPIER.World(stack.factoryContext.physics.gravity)

    for (const entity of stack.factoryContext.store.find("shape")) {
        createShapeRigidBody(particlePhysics, entity.components.shape.vertices)
    }

    const stackExtended: SystemStack<WebappFactoryContext, RuntimeSystemContext> = stack.extend({
        particlePhysics,
        replayCaptureService: new ReplayCaptureService(),
        config: defaultConfig,
        meta: {
            name,
            gamemode,
        },
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

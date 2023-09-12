import RAPIER from "@dimforge/rapier2d"
import { SystemStack } from "runtime-framework"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { newRuntime } from "runtime/src/Runtime"
import { RuntimeSystemContext } from "runtime/src/core/RuntimeSystemStack"
import { createShapeRigidBody } from "runtime/src/core/shape/ShapeFactory"
import { ReplayCaptureService } from "runtime/src/model/replay/ReplayCaptureService"
import { defaultConfig } from "../../../../../runtime/src/core/RuntimeConfig"
import { WebappComponents } from "./WebappComponents"
import { WebappFactoryContext } from "./WebappFactoryContext"
import { WebappRuntimeHook } from "./WebappRuntimeHook"
import { WebappSystemStack } from "./WebappSystemStack"
import { newCallFinishHookSystem } from "./common/CallFinishHookSystem"
import { newRegisterGraphicsSystem } from "./graphic/RegisterGraphicsSystem"
import { newInjectInterpolationSystem } from "./interpolation/InjectInterpolationSystem"
import { newCaptureParticleSpawnSystem } from "./particle-capture/CaptureParticleSpawnSystem"
import { newDeathParticleRemoverSystem } from "./particle-death/DeathParticleRemoverSystem"
import { newDeathParticleSpawnSystem } from "./particle-death/DeathParticleSpawnSystem"
import { newThrustParticleSpawnSystem } from "./particle-thrust/ThrustParticleSpawnSystem"
import { newParticleAgeSystem } from "./particle/ParticleAgeSystem"
import { newParticleStepSystem } from "./particle/ParticleStepSystem"
import { newReplayPlayingSystem } from "./replay/ReplayPlayingSystem"

export interface WebappRuntimeProps {
    world: WorldModel

    name: string
    gamemode: string

    replay?: ReplayModel

    hook?: WebappRuntimeHook
}

export const newWebappRuntime = (props: WebappRuntimeProps): WebappSystemStack => {
    const stack = newRuntime<WebappComponents>(props.world, props.gamemode)

    const particlePhysics = new RAPIER.World(stack.factoryContext.physics.gravity)

    for (const entity of stack.factoryContext.store.find("shape")) {
        createShapeRigidBody(particlePhysics, entity.components.shape.vertices)
    }

    const stackExtended: SystemStack<WebappFactoryContext, RuntimeSystemContext> = stack.extend({
        particlePhysics,
        replayCaptureService: new ReplayCaptureService(),
        config: defaultConfig,
        meta: {
            name: props.name,
            gamemode: props.gamemode,
        },
        hook: props.hook,
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
        newReplayPlayingSystem,
        newCallFinishHookSystem,
    )

    return stackExtended
}

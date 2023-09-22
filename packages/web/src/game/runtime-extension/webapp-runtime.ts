import RAPIER from "@dimforge/rapier2d"
import { SystemStack } from "runtime-framework"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { newRuntime } from "runtime/src/Runtime"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { createShapeRigidBody } from "runtime/src/core/shape/shape-factory"
import { ReplayCaptureService } from "runtime/src/model/replay/replay-capture-service"
import { defaultConfig } from "../../../../runtime/src/core/runtime-config"
import { newCallFinishHookSystem } from "./common/call-finish-hook-system"
import { newInjectInterpolationSystem } from "./interpolation/inject-interpolation-system"
import { newCaptureParticleSpawnSystem } from "./particle-capture/capture-particle-spawn-system"
import { newDeathParticleRemoverSystem } from "./particle-death/death-particle-remover-system"
import { newDeathParticleSpawnSystem } from "./particle-death/death-particle-spawn-system"
import { newThrustParticleSpawnSystem } from "./particle-thrust/thrust-particle-spawn-system"
import { newParticleAgeSystem } from "./particle/particle-age-system"
import { newParticleStepSystem } from "./particle/particle-step-system"
import { newReplayPlayingSystem } from "./replay/replay-playing-system"
import { WebappComponents } from "./webapp-components"
import { WebappFactoryContext } from "./webapp-factory-context"
import { WebappRuntimeHook } from "./webapp-runtime-hook"
import { WebappSystemStack } from "./webapp-system-stack"

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
        newDeathParticleSpawnSystem,
        newDeathParticleRemoverSystem,
        newReplayPlayingSystem,
        newCallFinishHookSystem,
    )

    return stackExtended
}

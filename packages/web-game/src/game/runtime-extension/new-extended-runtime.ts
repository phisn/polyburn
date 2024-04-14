import { SystemStack } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { newRuntime } from "runtime/src/runtime"
import { Scene, WebGLRenderer } from "three"
import { ExtendedFactoryContext } from "./extended-factory-context"

export function newExtendedRuntime(
    scene: Scene,
    renderer: WebGLRenderer,
    world: WorldModel,
    gamemodeName: string,
): SystemStack<ExtendedFactoryContext, RuntimeSystemContext> {
    const runtime = newRuntime(world, gamemodeName).extend({
        scene,
        renderer,
    })

    return runtime
}

export type ExtendedRuntime = ReturnType<typeof newExtendedRuntime>

import { SystemStack } from "runtime-framework"
import { WorldModel } from "runtime/proto/world"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"
import { RuntimeSystemContext } from "runtime/src/core/runtime-system-stack"
import { newRuntime } from "runtime/src/runtime"
import { ExtendedComponents } from "./components"

export function newExtendedRuntime(
    world: WorldModel,
    gamemodeName: string,
): SystemStack<RuntimeFactoryContext<ExtendedComponents>, RuntimeSystemContext> {
    const runtime = newRuntime(world, gamemodeName)
    return runtime
}

export type ExtendedRuntime = ReturnType<typeof newExtendedRuntime>

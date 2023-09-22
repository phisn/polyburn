import RAPIER from "@dimforge/rapier2d"
import { RuntimeFactoryContext } from "runtime/src/core/runtime-factory-context"

import { ReplayCaptureService } from "runtime/src/model/replay/replay-capture-service"
import { WebappComponents } from "./webapp-components"
import { WebappRuntimeHook } from "./webapp-runtime-hook"

interface MetaInfo {
    name: string
    gamemode: string
}

export interface WebappFactoryContext extends RuntimeFactoryContext<WebappComponents> {
    // visual only elements like particle effects need physical simulation. because we would
    // disrupt the deterministic functionality of the normal physics simulation, we use a separate one.
    particlePhysics: RAPIER.World
    replayCaptureService: ReplayCaptureService
    meta: MetaInfo
    hook?: WebappRuntimeHook
}

import RAPIER from "@dimforge/rapier2d-compat"
import { RuntimeFactoryContext } from "runtime/src/core/RuntimeFactoryContext"

import { WebappComponents } from "./WebappComponents"

export interface WebappFactoryContext extends RuntimeFactoryContext<WebappComponents> {
    // visual only elements like particle effects need physical simulation. because we would
    // disrupt the deterministic functionality of the normal physics simulation, we use a separate one.
    particlePhysics: RAPIER.World
}

import { RuntimeComponents } from "runtime/src/core/runtime-components"

import { EmptyComponent } from "runtime-framework"
import { InterpolatedComponent } from "./interpolation/interpolation-component"
import { ParticleSourceComponent } from "./particle/particle-source"
import { ReplayComponent } from "./replay/replay-component"

export interface WebappComponents extends RuntimeComponents {
    interpolation?: InterpolatedComponent
    particleSource?: ParticleSourceComponent
    deathParticleSource?: EmptyComponent
    replay?: ReplayComponent
}

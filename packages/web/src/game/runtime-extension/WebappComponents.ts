import { RuntimeComponents } from "runtime/src/core/RuntimeComponents"

import { EmptyComponent } from "runtime-framework"
import { InterpolationComponent } from "./interpolation/InterpolationComponent"
import { ParticleSourceComponent } from "./particle/ParticleSource"
import { ReplayComponent } from "./replay/ReplayComponent"

export interface WebappComponents extends RuntimeComponents {
    interpolation?: InterpolationComponent
    particleSource?: ParticleSourceComponent
    deathParticleSource?: EmptyComponent
    replay?: ReplayComponent
}

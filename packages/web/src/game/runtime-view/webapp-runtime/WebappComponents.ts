import { RuntimeComponents } from "runtime/src/core/RuntimeComponents"

import { GraphicComponent } from "./graphic/GraphicComponent"
import { InterpolationComponent } from "./interpolation/InterpolationComponent"
import { ParticleSourceComponent } from "./particle/ParticleSource"

export interface WebappComponents extends RuntimeComponents {
    graphic?: GraphicComponent
    interpolation?: InterpolationComponent
    particleSource?: ParticleSourceComponent
}
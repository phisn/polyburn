import { RuntimeComponents } from "runtime/src/core/RuntimeComponents"

import { GraphicComponent } from "./graphic/GraphicComponent"
import { InterpolationComponent } from "./interpolation/InterpolationComponent"
import { ParticleComponent } from "./particle/ParticleComponent"

export interface WebappComponents extends RuntimeComponents {
    graphic?: GraphicComponent
    interpolation?: InterpolationComponent
    particle?: ParticleComponent
}
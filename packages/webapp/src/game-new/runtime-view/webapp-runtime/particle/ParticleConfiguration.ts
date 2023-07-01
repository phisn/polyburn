import { Point } from "runtime/src/model/world/Point"

import { Gradient } from "./Gradient"

export interface ParticleConfiguration {
    spawnPosition: Point
    spawnVelocity: Point
    size: number

    lifeTime: number
    gradientOverTime: Gradient
}

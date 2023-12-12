import { Point } from "runtime/src/model/point"

import { Gradient } from "./gradient"
import { Particle } from "./particle"

// particle component acts as a ring buffer
export interface ParticleSourceComponent {
    bufferAmount: number
    amount: number

    latestParticle: number

    particles: (Particle | undefined)[]

    newConfig: () => ParticleConfiguration
}

export interface ParticleConfiguration {
    spawnPosition: Point

    spawnVelocity: Point
    additionalVelocity: Point

    size: number

    lifeTime: number
    gradientOverTime: Gradient
}

export const newParticleSourceComponent = (
    bufferAmount: number,
    newConfig: () => ParticleConfiguration,
): ParticleSourceComponent => ({
    bufferAmount,
    amount: 0,

    latestParticle: 0,

    particles: [],

    newConfig,
})

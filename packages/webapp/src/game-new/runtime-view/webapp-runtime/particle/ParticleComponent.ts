import { Gradient } from "./Gradient"

export interface ParticleComponent {
    size: number
    age: number
    lifeTime: number

    gradientOverTime: Gradient
}

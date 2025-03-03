import { Color } from "three"

export type ParticleTemplate = () => ParticleTemplateInstance

export interface ParticleTemplateInstance {
    velocity: number
    friction: number
    restitution: number

    lifetime: number
    size: number
    angle: number
    gradient: ParticleGradient

    shrinkAfter: number
    maxShrink: number
}

export function randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min)
}

export function randomBetweenDownBiased(min: number, max: number, bias: number): number {
    return min + downBias(Math.random(), bias) * (max - min)
}

export function downBias(value: number, bias: number): number {
    return 1 - Math.pow(1 - value, bias)
}

export type ParticleGradient = ParticleGradientEntry[]

export interface ParticleGradientEntry {
    time: number
    color: Color
}

// t in [0, 1] & gradient is sorted by time
export function resolveGradientColor(value: ParticleGradient, t: number, color: Color): void {
    if (value.length === 0) {
        return
    }

    if (t <= value[0].time) {
        color.copy(value[0].color)

        return
    }

    if (t >= value[value.length - 1].time) {
        color.copy(value[value.length - 1].color)

        return
    }

    for (let i = 0; i < value.length - 1; i++) {
        const entry = value[i]
        const nextEntry = value[i + 1]

        if (t >= entry.time && t <= nextEntry.time) {
            const dt = (t - entry.time) / (nextEntry.time - entry.time)
            color.lerpColors(entry.color, nextEntry.color, dt)

            break
        }
    }
}

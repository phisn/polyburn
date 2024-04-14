import { Color } from "three"

export interface ParticleTemplate {
    velocity: ParticleProperty
    friction: ParticleProperty
    restitution: ParticleProperty

    lifetime: ParticleProperty
    size: ParticleProperty
    angle: ParticleProperty
    gradient: ParticleGradient
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

export type ParticleProperty = number | { min: number; max: number }

export function resolveParticleProperty(value: ParticleProperty): number {
    if (typeof value === "number") {
        return value
    }

    return value.min + Math.random() * (value.max - value.min)
}

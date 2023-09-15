import { RocketDeathMessage } from "runtime/src/core/rocket/RocketDeathMessage"
import { Gradient } from "../particle/Gradient"
import { ParticleConfiguration } from "../particle/ParticleSource"

const minVelocity = 5
const maxVelocity = 30

const minAngle = 0
const maxAngle = 2 * Math.PI

const minLifetime = 15
const maxLifetime = 120

const minSize = 0.3
const maxSize = 0.7

const gradient: Gradient = [
    { color: [1.0, 0.726, 0.0], time: 0.0 }, // 0.000 },
    { color: [1.0, 0.618, 0.318], time: 0.2 }, // 0.188 },
    { color: [1.0, 0.0, 0.0], time: 0.4 }, // 0.394 },
    { color: [0.65, 0.65, 0.65], time: 0.65 }, // 0.476 },
    { color: [0.311, 0.311, 0.311], time: 1.0 }, // 0.732 },
]

export const newDeathParticleFactory = (death: RocketDeathMessage) => (): ParticleConfiguration => {
    const angle = Math.random() * (maxAngle - minAngle) + minAngle
    const velocity = Math.random() * (maxVelocity - minVelocity) + minVelocity

    const spawnAngle = {
        x: Math.sin(angle) + death.normal.x * 0.5,
        y: -Math.cos(angle) + death.normal.y * 0.5,
    }

    const spawnAngleLength = Math.sqrt(spawnAngle.x * spawnAngle.x + spawnAngle.y * spawnAngle.y)

    const spawnVelocity = {
        x: (velocity * spawnAngle.x) / spawnAngleLength,
        y: (velocity * spawnAngle.y) / spawnAngleLength,
    }

    return {
        spawnPosition: death.position,

        spawnVelocity,
        additionalVelocity: { x: 0, y: 0 },

        size: randomValueBetween(minSize, maxSize),
        lifeTime: Math.round(randomValueBetween(minLifetime, maxLifetime)),

        gradientOverTime: gradient,
    }
}

function randomValueBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}

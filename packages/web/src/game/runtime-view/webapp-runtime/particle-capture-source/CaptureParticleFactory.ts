import { LevelEntity } from "runtime/src/core/level/LevelEntity"

import { Gradient } from "../particle/Gradient"
import { ParticleConfiguration } from "../particle/ParticleSource"

const velocity = 20

const minLifetime = 50
const maxLifetime = 250

const minSize = 0.5
const maxSize = 1

const gradient: Gradient = [
    { color: [51 / 255, 255 / 255, 51 / 255], time: 0.0 }, // 0.188 },
    { color: [0 / 255, 51 / 255, 0 / 255], time: 1.0 }, // 0.000 },
]

export const newCaptureParticleFactory =
    (level: LevelEntity) => (): ParticleConfiguration => {
        const randomAngle = randomValueBetween(0, 2 * Math.PI)

        const spawnVelocity = {
            x: velocity * Math.sin(randomAngle),
            y: velocity * Math.cos(randomAngle),
        }

        return {
            spawnPosition: level.components.level.flag,

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

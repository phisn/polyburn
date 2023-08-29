import { LevelEntity } from "runtime/src/core/level/LevelEntity"

import { EntityType } from "runtime/proto/world"
import { changeAnchor } from "runtime/src/model/world/changeAnchor"
import { entityRegistry } from "runtime/src/model/world/entityRegistry"
import { Gradient } from "../particle/Gradient"
import { ParticleConfiguration } from "../particle/ParticleSource"

const minAngle = Math.PI * 2 - Math.PI / 3
const maxAngle = Math.PI / 3

const minVelocity = 5
const maxVelocity = 20

const minLifetime = 50
const maxLifetime = 250

const minSize = 0.5
const maxSize = 1

const gradient: Gradient = [
    { color: [51 / 255, 255 / 255, 51 / 255], time: 0.0 }, // 0.188 },
    { color: [0 / 255, 51 / 255, 0 / 255], time: 1.0 }, // 0.000 },
]

export const newCaptureParticleFactory = (level: LevelEntity) => (): ParticleConfiguration => {
    const velocity = randomValueBetween(minVelocity, maxVelocity)

    const spawnPosition = changeAnchor(
        level.components.level.flag,
        level.components.level.flagRotation,
        entityRegistry[EntityType.ROCKET],
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.0 },
    )

    const randomAngle = randomValueBetween(minAngle, maxAngle)

    const spawnVelocity = {
        x: velocity * Math.sin(level.components.level.flagRotation + randomAngle),
        y: velocity * Math.cos(level.components.level.flagRotation + randomAngle) * -1,
    }

    return {
        spawnPosition,

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

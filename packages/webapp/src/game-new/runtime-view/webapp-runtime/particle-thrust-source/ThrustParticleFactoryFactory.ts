import { RocketEntity } from "runtime/src/core/rocket/RocketEntity"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { EntityModelType } from "runtime/src/model/world/EntityModelType"

import { Gradient, rgpRemixGradient } from "../particle-source/Gradient"
import { ParticleConfiguration } from "../particle-source/ParticleSourceComponent"

const velocity = 15  

const minAngle = -Math.PI / 16
const maxAngle = Math.PI / 16

const minLifetime = 24 * 0.9
const maxLifetime = 42 * 0.9

const minSize = 0.30
const maxSize = 0.70 

const gradient: Gradient = rgpRemixGradient([
    { color: [1.000, 0.726, 0.000], time: 0.000 }, // 0.000 },
    { color: [1.000, 0.618, 0.318], time: 0.200 }, // 0.188 },
    { color: [1.000, 0.000, 0.000], time: 0.400 }, // 0.394 },
    { color: [0.650, 0.650, 0.650], time: 0.650 }, // 0.476 },
    { color: [0.311, 0.311, 0.311], time: 1.000 }, // 0.732 },
])

export const newThrustParticleFactory = (rocket: RocketEntity) => (): ParticleConfiguration => {
    const rocketEntry = entityModelRegistry[EntityModelType.Rocket]

    const rocketRotation = rocket.components.rigidBody.rotation()

    const spawnPosition = changeAnchor(
        rocket.components.rigidBody.translation(),
        rocketRotation,
        rocketEntry,
        { x: 0.5, y: 0.5 },
        { x: 0.5, y: 0.3  })

    const randomAngle = randomValueBetween(minAngle, maxAngle)

    const spawnVelocity = {
        x: velocity * Math.sin(rocketRotation + randomAngle),
        y: velocity * Math.cos(rocketRotation + randomAngle) * -1
    }

    return {
        spawnPosition,
        spawnVelocity,

        size: randomValueBetween(minSize, maxSize),
        lifeTime: Math.round(randomValueBetween(minLifetime, maxLifetime)),

        gradientOverTime: gradient
    }
}

function randomValueBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}


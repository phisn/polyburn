import { RocketEntity } from "runtime/src/core/rocket/RocketEntity"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { randInt } from "three/src/math/MathUtils"

import { EntityType } from "runtime/src/core/common/EntityType"
import { Gradient, rgpRemixGradient } from "../particle/Gradient"
import { ParticleConfiguration } from "../particle/ParticleSource"

const velocity = 15

const minAngle = -Math.PI / 16
const maxAngle = Math.PI / 16

const minLifetime = 24 * 0.9
const maxLifetime = 42 * 0.9

const minSize = 0.3
const maxSize = 0.7

const gradient: Gradient = [
    { color: [1.0, 0.726, 0.0], time: 0.0 }, // 0.000 },
    { color: [1.0, 0.618, 0.318], time: 0.2 }, // 0.188 },
    { color: [1.0, 0.0, 0.0], time: 0.4 }, // 0.394 },
    { color: [0.65, 0.65, 0.65], time: 0.65 }, // 0.476 },
    { color: [0.311, 0.311, 0.311], time: 1.0 }, // 0.732 },
]

const mixedIndex = randInt(0, 4)

const mixed = [
    gradient,
    rgpRemixGradient(gradient, [2, 1, 0]),
    rgpRemixGradient(gradient, [2, 0, 1]),
    rgpRemixGradient(gradient, [1, 2, 0]),
    rgpRemixGradient(gradient, [1, 0, 2]),
][mixedIndex]

console.log(`choosen gradient: ${mixedIndex}`)

export const newThrustParticleFactory =
    (rocket: RocketEntity) => (): ParticleConfiguration => {
        const rocketEntry = entityModelRegistry[EntityType.Rocket]

        const rigidBody = rocket.components.rigidBody
        const rocketRotation = rigidBody.rotation()

        const spawnPosition = changeAnchor(
            rigidBody.translation(),
            rocketRotation,
            rocketEntry,
            { x: 0.5, y: 0.5 },
            { x: 0.5, y: 0.3 },
        )

        console.log(
            `rigidbody is at ${JSON.stringify(
                rigidBody.translation(),
            )}, spawnPosition is ${JSON.stringify(spawnPosition)}`,
        )

        const randomAngle = randomValueBetween(minAngle, maxAngle)

        const spawnVelocity = {
            x: velocity * Math.sin(rocketRotation + randomAngle),
            y: velocity * Math.cos(rocketRotation + randomAngle) * -1,
        }

        return {
            spawnPosition,

            spawnVelocity,
            additionalVelocity: rigidBody.linvel(),

            size: randomValueBetween(minSize, maxSize),
            lifeTime: Math.round(randomValueBetween(minLifetime, maxLifetime)),

            gradientOverTime: mixed,
        }
    }

function randomValueBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}

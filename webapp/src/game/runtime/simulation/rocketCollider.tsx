import { entities } from "../../../model/world/Entities"
import { EntityType } from "../../../model/world/Entity"

const rawRocketColliders = [
    [
        1, 502,
        3, 355,
        5, 324,
        11, 284,
        32, 202,
        74, 108,
        117, 42,
        150, 0,
        183, 42,
        226, 108,
        268, 202,
        289, 284,
        295, 324,
        297, 355,
        299, 502
    ],
    [
        300, 600,
        190, 502,
        299, 502
    ],
    [
        0, 600,
        1, 502,
        110, 502
    ]
]

const entry = entities[EntityType.Rocket]

export const rocketColliders = rawRocketColliders.map(s => s.map((v, i) => {
    const moved = i % 2 === 0 
        ? v - entry.size.width / 2 
        : v - entry.size.height / 2

    const scaled = moved * entry.scale

    return Math.round(scaled * 1000) / 1000
}))

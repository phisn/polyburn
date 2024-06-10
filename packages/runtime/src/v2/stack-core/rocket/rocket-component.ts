import { EntityWith } from "runtime-framework"
import { Point } from "../../../model/point"
import { CoreComponents } from "../core-components"

export interface RocketComponent {
    thrusting: boolean

    collisionCount: number
    rotationWithoutInput: number

    spawnPosition: Point
    spawnRotation: number

    currentLevel: EntityWith<CoreComponents, "level">
    framesSinceLastDeath: number
}

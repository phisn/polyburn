import { EntityWith } from "runtime-framework/src/narrow-properties"
import { Point } from "../../model/point"
import { RuntimeComponents } from "../runtime-components"

export interface RocketComponent {
    collisionCount: number
    rotationWithoutInput: number

    spawnPosition: Point
    spawnRotation: number

    currentLevel: EntityWith<RuntimeComponents, "level">
    framesSinceLastDeath: number
}

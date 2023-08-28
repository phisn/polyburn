import { EntityWith } from "runtime-framework/src/NarrowProperties"

import { Point } from "../../model/Point"
import { RuntimeComponents } from "../RuntimeComponents"

export interface RocketComponent {
    collisionCount: number
    rotationWithoutInput: number

    spawnPosition: Point
    spawnRotation: number

    currentLevel: EntityWith<RuntimeComponents, "level">
    framesSinceLastDeath: number
}

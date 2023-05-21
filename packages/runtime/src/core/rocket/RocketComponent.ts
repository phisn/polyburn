import { Point } from "../../model/world/Point"

export interface RocketComponent {
    collisionCount: number
    rotationWithoutInput: number

    spawnPosition: Point
    spawnRotation: number
}

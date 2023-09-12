import { LevelEntity } from "../level/LevelEntity"

export interface LevelCapturingComponent {
    level: LevelEntity
    timeToCapture: number
    collidersInside: number
}

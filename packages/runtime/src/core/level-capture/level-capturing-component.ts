import { LevelEntity } from "../level/level-entity"

export interface LevelCapturingComponent {
    level: LevelEntity
    timeToCapture: number
    collidersInside: number
}

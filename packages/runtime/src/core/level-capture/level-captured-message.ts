import { LevelEntity } from "../level/level-entity"
import { RocketEntity } from "../rocket/rocket-entity"

export interface LevelCapturedMessage {
    level: LevelEntity
    rocket: RocketEntity
}

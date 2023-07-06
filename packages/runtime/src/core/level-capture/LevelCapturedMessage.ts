import { LevelEntity } from "../level/LevelEntity"
import { RocketEntity } from "../rocket/RocketEntity"

export interface LevelCapturedMessage {
    level: LevelEntity
    rocket: RocketEntity
}

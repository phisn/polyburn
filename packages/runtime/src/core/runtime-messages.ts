import { EmptyMessage } from "runtime-framework"
import { CollisionMessage } from "./collision/collision-message"
import { LevelCapturedMessage } from "./level-capture/level-captured-message"
import { RocketDeathMessage } from "./rocket/rocket-death-message"

export interface RuntimeMessages {
    collision?: CollisionMessage
    finished?: EmptyMessage
    levelCaptured?: LevelCapturedMessage
    rocketDeath?: RocketDeathMessage
}

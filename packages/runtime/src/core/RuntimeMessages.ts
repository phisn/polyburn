import { EmptyMessage } from "runtime-framework"

import { CollisionMessage } from "./collision/CollisionMessage"
import { LevelCapturedMessage } from "./level-capture/LevelCapturedMessage"

export interface RuntimeMessages {
    collision?: CollisionMessage
    finished?: EmptyMessage
    levelCaptured?: LevelCapturedMessage
}

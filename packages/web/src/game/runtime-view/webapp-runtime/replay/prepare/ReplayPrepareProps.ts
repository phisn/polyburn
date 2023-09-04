import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"

export interface ReplayPrepareProps {
    world: WorldModel
    gamemode: string
    replay: ReplayModel
}

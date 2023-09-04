import { ReplayStats } from "runtime/src/model/replay/ReplayStats"

export interface Replay {
    world: string
    gamemode: string

    stats: ReplayStats
    model: string
}

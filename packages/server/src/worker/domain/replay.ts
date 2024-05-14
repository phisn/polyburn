import { ReplayStats } from "runtime/src/model/replay/replay-stats"

export interface Replay {
    world: string
    gamemode: string

    stats: ReplayStats
    model: string
}

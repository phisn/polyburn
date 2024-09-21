import RAPIER from "@dimforge/rapier2d"
import { ReplayModel } from "../../../proto/replay"
import { WorldConfig } from "../../../proto/world"
import { ReplayStats } from "./replay-stats"
import { runtimeFromReplay } from "./runtime-from-replay"

export function validateReplay(
    rapier: typeof RAPIER,
    replay: ReplayModel,
    world: WorldConfig,
    gamemode: string,
): ReplayStats | false {
    const runtime = runtimeFromReplay(rapier, replay, world, gamemode)
    const worldComponent = runtime.resources.get("summary")

    if (worldComponent?.finished) {
        return {
            ticks: worldComponent.ticks,
            deaths: worldComponent.deaths,
        }
    }

    return false
}

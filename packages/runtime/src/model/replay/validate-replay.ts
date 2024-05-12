import RAPIER from "@dimforge/rapier2d"
import { ReplayModel } from "../../../proto/replay"
import { WorldModel } from "../../../proto/world"
import { ReplayStats } from "./replay-stats"
import { runtimeFromReplay } from "./runtime-from-replay"

export function validateReplay(
    rapier: typeof RAPIER,
    replay: ReplayModel,
    world: WorldModel,
    gamemode: string,
): ReplayStats | false {
    const runtime = runtimeFromReplay(rapier, replay, world, gamemode)
    const worldComponent = runtime.factoryContext.store.world.components.stats

    if (worldComponent?.finished) {
        return {
            ticks: worldComponent.ticks,
            deaths: worldComponent.deaths,
        }
    }

    return false
}

import { ReplayModel } from "../../../proto/replay"
import { WorldModel } from "../../../proto/world"
import { newRuntime } from "../../Runtime"
import { replayFramesFromBytes } from "./Replay"
import { ReplayStats } from "./ReplayStats"

export function validateReplay(
    replay: ReplayModel,
    world: WorldModel,
    gamemode: string,
): ReplayStats | false {
    const replayFrames = replayFramesFromBytes(replay.frames)
    const stack = newRuntime(world, gamemode)

    let accumulator = 0

    for (const frame of replayFrames) {
        accumulator += frame.diff

        stack.step({
            rotation: accumulator,
            thrust: frame.thrust,
        })
    }

    const worldComponent = stack.factoryContext.store.world.components.world

    if (worldComponent?.finished) {
        return {
            ticks: worldComponent.ticks,
            deaths: worldComponent.deaths,
        }
    }

    return false
}

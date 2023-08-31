import { ReplayModel } from "../../../proto/replay"
import { WorldModel } from "../../../proto/world"
import { newRuntime } from "../../Runtime"
import { RuntimeSystemStack } from "../../core/RuntimeSystemStack"
import { replayFramesFromBytes } from "./Replay"

export function runtimeFromReplay(
    replay: ReplayModel,
    world: WorldModel,
    gamemode: string,
    handler?: (stack: RuntimeSystemStack) => void,
) {
    const replayFrames = replayFramesFromBytes(replay.frames)
    const stack = newRuntime(world, gamemode)

    let accumulator = 0

    for (const frame of replayFrames) {
        accumulator += frame.diff

        stack.step({
            rotation: accumulator,
            thrust: frame.thrust,
        })

        handler?.(stack)
    }

    return stack
}

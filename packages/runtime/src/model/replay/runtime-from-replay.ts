import RAPIER from "@dimforge/rapier2d"
import { ReplayModel } from "../../../proto/replay"
import { WorldModel } from "../../../proto/world"
import { RuntimeSystemContext, RuntimeSystemStack } from "../../core/runtime-system-stack"
import { newRuntime } from "../../runtime"
import { replayFramesFromBytes } from "./replay"

export function runtimeFromReplay<T>(
    rapier: typeof RAPIER,
    replay: ReplayModel,
    world: WorldModel,
    gamemode: string,
    initializer?: (stack: RuntimeSystemStack) => T,
    handler?: (
        stack: RuntimeSystemStack,
        step: RuntimeSystemContext,
        context: T | undefined,
    ) => void,
) {
    const replayFrames = replayFramesFromBytes(replay.frames)
    const stack = newRuntime(rapier, world, gamemode)

    let accumulator = 0

    const context = initializer?.(stack)

    for (const frame of replayFrames) {
        accumulator += frame.diff

        const step = {
            rotation: accumulator,
            thrust: frame.thrust,
        }

        stack.step(step)
        handler?.(stack, step, context)
    }

    return stack
}

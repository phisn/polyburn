import { WorldModel } from "../../../proto/world";
import { newRuntime } from "../../Runtime";
import { Replay } from "./Replay";

export function validateReplay(replay: Replay, world: WorldModel, gamemode: string) {
    const stack = newRuntime(world, gamemode)

    let accumulator = 0

    for (const frame of replay.frames) {
        accumulator += frame.diff

        stack.step({
            rotation: accumulator,
            thrust: frame.thrust,
        })
    }

    return stack.factoryContext.store.world.components.world?.finished ?? false
}
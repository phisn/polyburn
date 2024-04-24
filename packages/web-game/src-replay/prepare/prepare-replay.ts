import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { RocketEntityComponents } from "runtime/src/core/rocket/rocket-entity"
import { runtimeFromReplay } from "runtime/src/model/replay/runtime-from-replay"
import { PreparedFrame, ReplayPrepared } from "./replay-repared"

export function prepareReplay(
    replay: ReplayModel,
    world: WorldModel,
    gamemode: string,
): ReplayPrepared {
    const frames: PreparedFrame[] = []

    runtimeFromReplay(replay, world, gamemode, stack => {
        const [entity] = stack.factoryContext.store.find(...RocketEntityComponents)

        frames.push({
            position: entity.components.rigidBody.translation(),
            rotation: entity.components.rigidBody.rotation(),
        })
    })

    return {
        frames,
    }
}

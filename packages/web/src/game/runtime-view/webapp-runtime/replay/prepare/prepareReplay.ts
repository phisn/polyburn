import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { runtimeFromReplay } from "runtime/src/model/replay/runtimeFromReplay"
import { PreparedFrame, ReplayPrepared } from "./ReplayPrepared"

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

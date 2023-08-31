import { RocketEntityComponents } from "runtime/src/core/rocket/RocketEntity"
import { runtimeFromReplay } from "runtime/src/model/replay/runtimeFromReplay"
import { ReplayPrepareProps } from "./ReplayPrepareProps"
import { PreparedFrame, ReplayPrepared } from "./ReplayPrepared"

onmessage = (event: MessageEvent<ReplayPrepareProps>) => {
    const frames: PreparedFrame[] = []

    runtimeFromReplay(event.data.replay, event.data.world, event.data.gamemode, stack => {
        const [entity] = stack.factoryContext.store.find(...RocketEntityComponents)

        frames.push({
            position: entity.components.rigidBody.translation(),
            rotation: entity.components.rigidBody.rotation(),
        })
    })

    const prepared: ReplayPrepared = {
        frames,
    }

    postMessage(prepared)
}

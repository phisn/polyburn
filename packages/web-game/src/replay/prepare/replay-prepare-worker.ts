import { prepareReplay } from "./prepare-replay"
import { ReplayPrepareProps } from "./replay-prepare-props"

onmessage = (event: MessageEvent<ReplayPrepareProps>) => {
    postMessage(prepareReplay(event.data.replay, event.data.world, event.data.gamemode))
}

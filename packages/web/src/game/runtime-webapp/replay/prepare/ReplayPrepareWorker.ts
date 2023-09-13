import { ReplayPrepareProps } from "./ReplayPrepareProps"
import { prepareReplay } from "./prepareReplay"

onmessage = (event: MessageEvent<ReplayPrepareProps>) => {
    postMessage(prepareReplay(event.data.replay, event.data.world, event.data.gamemode))
}

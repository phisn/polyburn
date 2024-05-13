import RAPIER from "@dimforge/rapier2d"
import { prepareReplay } from "./prepare-replay"
import { ReplayPrepareProps } from "./replay-prepare-props"

onmessage = (event: MessageEvent<ReplayPrepareProps>) => {
    postMessage(prepareReplay(RAPIER, event.data.replay, event.data.world, event.data.gamemode))
}

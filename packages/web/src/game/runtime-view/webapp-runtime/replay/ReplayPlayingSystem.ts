import { WebappSystemFactory } from "../WebappSystemFactory"

export const newReplayPlayingSystem: WebappSystemFactory = ({ store }) => {
    const replays = store.newSet("replay")

    return () => {
        for (const replay of replays) {
            replay.components.replay.frame++
        }
    }
}

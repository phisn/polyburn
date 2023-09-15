import { WebappSystemFactory } from "../WebappSystemFactory"

export const newReplayPlayingSystem: WebappSystemFactory = ({ store }) => {
    const replays = store.newSet("replay")

    return () => {
        for (const replay of replays) {
            if (
                replay.components.replay.frame + 1 >=
                replay.components.replay.prepared.frames.length
            ) {
                store.remove(replay.id)
            } else {
                replay.components.replay.frame++
            }
        }
    }
}

import { RuntimeSystemFactory } from "../runtime-system-factory"

export const newWorldFinishSystem: RuntimeSystemFactory = ({ store, messageStore }) => {
    const captures = messageStore.collect("levelCaptured")
    const levels = store.newSet("level")

    return () => {
        if (
            store.world.has("stats") &&
            [...captures].length > 0 &&
            [...levels].every(level => level.components.level.captured)
        ) {
            store.world.components.stats.finished = true
            messageStore.publish("finished", {})
        }
    }
}

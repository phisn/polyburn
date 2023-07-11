import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newWorldFinishSystem: RuntimeSystemFactory = ({
    store,
    messageStore,
}) => {
    const captures = messageStore.collect("levelCaptured")
    const levels = store.newSet("level")

    return () => {
        if (store.world.has("world")) {
            if ([...captures].length > 0) {
                if (
                    [...levels].every(level => level.components.level.captured)
                ) {
                    store.world.components.world.finished = true
                    messageStore.publish("finished", {})
                }
            }
        }
    }
}

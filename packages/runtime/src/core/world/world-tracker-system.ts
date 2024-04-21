import { RuntimeSystemFactory } from "../runtime-system-factory"

export const newWorldTrackerSystem: RuntimeSystemFactory = ({ store, messageStore }) => {
    const deathMessages = messageStore.collect("rocketDeath")

    return () => {
        if (store.world.has("stats") && store.world.components.stats.finished === false) {
            store.world.components.stats.ticks++
            store.world.components.stats.deaths += [...deathMessages].length
        }
    }
}

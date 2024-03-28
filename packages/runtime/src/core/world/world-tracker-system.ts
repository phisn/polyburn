import { RuntimeSystemFactory } from "../runtime-system-factory"

export const newWorldTrackerSystem: RuntimeSystemFactory = ({ store, messageStore }) => {
    const deathMessages = messageStore.collect("rocketDeath")

    return () => {
        if (store.world.has("world") && store.world.components.world.finished === false) {
            store.world.components.world.ticks++
            store.world.components.world.deaths += [...deathMessages].length
        }
    }
}

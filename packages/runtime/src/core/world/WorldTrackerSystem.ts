import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newWorldTrackerSystem: RuntimeSystemFactory = ({ store }) => {
    return (context) => {
        if (store.world.has("world") && store.world.components.world.finished === false) {
            store.world.components.world.ticks++
            store.world.components.world.replay.push(context)
        }
    }
}

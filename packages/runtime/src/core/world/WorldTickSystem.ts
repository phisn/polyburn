import { RuntimeSystemFactory } from "../RuntimeSystemFactory"

export const newWorldTickSystem: RuntimeSystemFactory = ({ store }) => {
    return () => {
        if (store.world.has("world") && store.world.components.world.finished === false) {
            store.world.components.world.ticks++
        }
    }
}

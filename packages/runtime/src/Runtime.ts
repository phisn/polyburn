import RAPIER from "@dimforge/rapier2d-compat"
import { createEntityStore } from "runtime-framework"

import { Meta } from "./core/Meta"
import { Gamemode } from "./gamemode/Gamemode"
import { WorldModel } from "./model/world/WorldModel"

export const newRuntime = (gamemode: Gamemode, world: WorldModel) => {
    const meta: Meta = {
        rapier: new RAPIER.World(new RAPIER.Vector2(0, 0)),
        queue: new RAPIER.EventQueue(true)
    }

    const store = createEntityStore()

    return {
        store,
        stack: gamemode(meta, store, world)
    }
}

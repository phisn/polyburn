import RAPIER from "@dimforge/rapier2d-compat"

import { createEntityStore } from "../../runtime-framework/src"
import { Meta } from "./core/Meta"
import { RuntimeComponents } from "./core/RuntimeComponents"
import { Gamemode } from "./gamemode/Gamemode"
import { WorldModel } from "./model/world/WorldModel"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()

export const newRuntime = (gamemode: Gamemode, world: WorldModel) => {
    const meta: Meta = {
        rapier: new RAPIER.World(new RAPIER.Vector2(0, 0)),
        queue: new RAPIER.EventQueue(true)
    }

    const store = createEntityStore<RuntimeComponents>()

    return {
        store,
        stack: gamemode(meta, store, world)
    }
}

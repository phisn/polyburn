import RAPIER from "@dimforge/rapier2d-compat"

import { createEntityStore } from "../../runtime-framework/src"
import { createMessageStore } from "../../runtime-framework/src/MessageStore"
import { RuntimeComponents } from "./core/RuntimeComponents"
import { RuntimeFactoryContext } from "./core/RuntimeFactoryContext"
import { Gamemode } from "./gamemode/Gamemode"
import { WorldModel } from "./model/world/WorldModel"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rapierInit = RAPIER.init()

export const newRuntime = <Components extends RuntimeComponents> (gamemode: Gamemode, world: WorldModel) => {
    const context: RuntimeFactoryContext<Components> = {
        store: createEntityStore(),
        messageStore: createMessageStore(),

        rapier: new RAPIER.World(new RAPIER.Vector2(0, 0)),
        queue: new RAPIER.EventQueue(true),
    }

    return {
        store: context.store,
        stack: gamemode(context, world)
    }
}

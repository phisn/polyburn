import RAPIER from "@dimforge/rapier2d-compat"

import { createEntityStore } from "../../runtime-framework/src"
import { createMessageStore } from "../../runtime-framework/src/MessageStore"
import { RuntimeComponents } from "./core/RuntimeComponents"
import { RuntimeFactoryContext } from "./core/RuntimeFactoryContext"
import { Gamemode } from "./gamemode/Gamemode"
import { WorldModel } from "./model/world/WorldModel"

const rapierInit = RAPIER.init()

export const newRuntime = <Components extends RuntimeComponents>(
    gamemode: Gamemode,
    world: WorldModel,
) => {
    const context: RuntimeFactoryContext<Components> = {
        store: createEntityStore(),
        messageStore: createMessageStore(),

        physics: new RAPIER.World(new RAPIER.Vector2(0, 0)),
        queue: new RAPIER.EventQueue(true),
    }

    return {
        context,
        stack: gamemode(context, world),
    }
}

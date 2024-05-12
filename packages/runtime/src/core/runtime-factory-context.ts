import RAPIER from "@dimforge/rapier2d"
import { EntityStoreState, MessageStore } from "runtime-framework"
import { WorldModel } from "../../proto/world"
import { RuntimeComponents } from "./runtime-components"
import { RuntimeConfig } from "./runtime-config"
import { RuntimeMessages } from "./runtime-messages"

export interface RuntimeFactoryContext<Components extends RuntimeComponents> {
    config: RuntimeConfig
    store: EntityStoreState<Components>
    messageStore: MessageStore<Components, RuntimeMessages>

    gamemode: string
    worldmodel: WorldModel
    rapier: typeof RAPIER
    physics: RAPIER.World
    queue: RAPIER.EventQueue
}

export type RuntimeFactoryContextBooting<Components extends RuntimeComponents> = Omit<
    RuntimeFactoryContext<Components>,
    "config"
>

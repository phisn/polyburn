import RAPIER from "@dimforge/rapier2d"
import { EntityStoreState, MessageStore } from "runtime-framework"
import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeConfig } from "./RuntimeConfig"
import { RuntimeMessages } from "./RuntimeMessages"

export interface RuntimeFactoryContext<Components extends RuntimeComponents> {
    config: RuntimeConfig
    store: EntityStoreState<Components>
    messageStore: MessageStore<Components, RuntimeMessages>

    physics: RAPIER.World
    queue: RAPIER.EventQueue
}

export type RuntimeFactoryContextBooting<Components extends RuntimeComponents> = Omit<
    RuntimeFactoryContext<Components>,
    "config"
>

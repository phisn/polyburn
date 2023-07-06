import RAPIER from "@dimforge/rapier2d-compat"
import { EntityStoreState, MessageStore } from "runtime-framework"

import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeMessages } from "./RuntimeMessages"

export interface RuntimeFactoryContext<Components extends RuntimeComponents> {
    store: EntityStoreState<Components>
    messageStore: MessageStore<Components, RuntimeMessages>

    physics: RAPIER.World
    queue: RAPIER.EventQueue
}

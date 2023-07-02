import RAPIER from "@dimforge/rapier2d-compat"
import { EntityStoreState, MessageStore } from "runtime-framework"

import { RuntimeComponents } from "./RuntimeComponents"
import { RuntimeMessage } from "./RuntimeMessage"

export interface RuntimeFactoryContext<Components extends RuntimeComponents> {
    store: EntityStoreState<Components>
    messageStore: MessageStore<RuntimeMessage>

    rapier: RAPIER.World
    queue: RAPIER.EventQueue
}

import { RuntimeEntity } from "./RuntimeEntity"
import { RuntimeMetaState } from "./RuntimeMetaState"

export type RuntimeSystem = () => void 

export interface RuntimeState {
    meta: RuntimeMetaState

    entities: Map<number, RuntimeEntity>
    systems: RuntimeSystem[]
}

export interface RuntimeStore {
    state: RuntimeState

    addEntity(entity: RuntimeEntity): void
    addSystem(system: RuntimeSystem): void

    removeEntity(entity: RuntimeEntity): void

    newEntities: RuntimeEntity[]
    removedEntities: RuntimeEntity[]
}

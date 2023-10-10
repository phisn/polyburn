import { StoreApi, UseBoundStore } from "zustand"
import { EntityEditModel } from "../store/edit-models/entity-edit-model"
import { WorldEditModel } from "../store/edit-models/world-edit-model"
import { EditorStoreApi } from "../store/store"

export interface EditorEcsStore {
    subscribe(listener: () => void): () => void
    subscribeComponents(component: string, listener: () => void): () => void
    subscribeEntity(entityId: number, listener: () => void): () => void
}

export type EditorEcsStoreApi = UseBoundStore<StoreApi<EditorEcsStore>>

export const createEcsStore = (store: EditorStoreApi) => {
    const listeners = new Set<() => void>()
    const componentListeners = new Map<string, Set<() => void>>()
    const entityListeners = new Map<number, Set<() => void>>()

    const entities = new Map<number, EntityEditModel>()

    // we generally have no good way to unsubscribe from the store, so we just
    // keep the subscription alive as lon as there are listeners
    let subscription: undefined | (() => void) = undefined

    return {
        subscribe: (entityId: number | undefined, listener: () => void) => {
            /*
            if (subscription === undefined) {
                subscription = subscribe()
            }

            const entityListeners = listeners.get(entityId)

            if (entityListeners === undefined) {
                listeners.set(entityId, [listener])
            } else {
                entityListeners.push(listener)
            }

            return () => {
                listeners.delete(entityId)

                if (listeners.size === 0) {
                    subscription?.()
                    subscription = undefined
                }
            }
            */
        },
    }

    function subscribe() {
        return store.subscribe((state, previousState) => {
            if (state.view === previousState.view) {
                return
            }

            const changed = changedEntities(state.view, previousState.view)

            for (const entity of changed) {
                if (entities.get(entity.id) !== entity) {
                    entities.set(entity.id, entity)
                }
            }

            for (const entity of changed) {
                for (const listener of entityListeners.get(entity.id) ?? []) {
                    listener()
                }

                for (const componentName of Object.keys(entity.components)) {
                    for (const listener of componentListeners.get(componentName) ?? []) {
                        listener()
                    }
                }
            }

            for (const listener of listeners) {
                listener()
            }
        })
    }

    function changedEntities(state: WorldEditModel, previous: WorldEditModel) {
        const changed: EntityEditModel[] = []

        for (const entity of state.entities.values()) {
            const previousEntity = previous.entities.get(entity.id)

            if (entity !== previousEntity) {
                changed.push(entity)
            }
        }

        return changed
    }
}

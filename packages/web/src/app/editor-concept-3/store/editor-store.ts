import { applyPatches, enableMapSet, enablePatches, Patch, produce } from "immer"
import { NarrowProperties } from "runtime-framework"
import { EntityComponents } from "./models-entities/entity-components"
import { EditorStoreState } from "./models/editor-state"
import { Entity, entityHas, Immutable, ImmutableEntity } from "./models/entity"

enableMapSet()
enablePatches()

export interface EditorStore {
    subscribe(listener: () => void): () => void

    undo(): void
    redo(): void

    selected(): Immutable<Entity[]>

    entities(): Map<number, ImmutableEntity>

    entitiesWithComponents<T extends (keyof EntityComponents)[]>(
        ...componentNames: T
    ): Immutable<Entity<NarrowProperties<EntityComponents, T[number]>>[]>

    mutate(mutation: (state: EditorStoreState) => void): void
}

export const createEditorStore = (): EditorStore => {
    // create our initial immutable entities map
    let state: EditorStoreState = produce(
        {
            gamemodes: [],
            entities: new Map<number, Entity>(),
            selected: [],
        },
        () => {},
    )

    const listeners = new Set<() => void>()

    const undos: Patch[][] = []
    const redos: Patch[][] = []

    // components => entities. caching all entities with these specific components.
    // unspecific types because value is dependent on key which is not describable in typescript for generics.
    // (especially when the key is a concatenation of multiple strings)
    const componentCache = new Map<string, ImmutableEntity[]>()

    // we want to fix the caches after an entity changed in it.
    // to know which caches have to be fixed we use a lookup table to see where a specific entity components are used.
    const componentInComponentCache = new Map<PropertyKey, string[]>()

    let selected: ImmutableEntity[] = []

    updateCache(state)

    return {
        subscribe(listener) {
            listeners.add(listener)

            return () => {
                listeners.delete(listener)
            }
        },
        undo() {
            const changes = undos.pop()

            if (changes === undefined) {
                return
            }

            redos.push(changes)
            updateState(applyPatches(state, changes))
        },
        redo() {
            const changes = redos.pop()

            if (changes === undefined) {
                return
            }

            undos.push(changes)
            updateState(applyPatches(state, changes))
        },
        selected() {
            return []
        },
        entities() {
            return state.entities
        },
        entitiesWithComponents<T extends (keyof EntityComponents)[]>(...componentNames: T) {
            const joined = componentNames.join(",")

            let cached = componentCache.get(joined)

            if (cached === undefined) {
                cached = []

                for (const entity of state.entities.values()) {
                    if (entityHas(entity, ...componentNames)) {
                        cached.push(entity)
                    }
                }

                componentCache.set(joined, cached)

                for (const componentName of componentNames) {
                    let componentCacheKeys = componentInComponentCache.get(componentName)

                    if (componentCacheKeys === undefined) {
                        componentCacheKeys = []
                        componentInComponentCache.set(componentName, componentCacheKeys)
                    } else if (componentCacheKeys.includes(joined)) {
                        continue
                    }

                    componentCacheKeys.push(joined)
                }
            }

            return cached as ImmutableEntity<NarrowProperties<EntityComponents, T[number]>>[]
        },
        mutate(mutation) {
            const changes: Patch[] = []
            const inverseChanges: Patch[] = []

            const newState = produce(state, mutation, (patches, inversePatches) => {
                changes.push(...patches)
                inverseChanges.push(...inversePatches)
            })

            undos.push(inverseChanges)
            redos.length = 0

            updateState(newState)
        },
    }

    function updateState(newState: EditorStoreState) {
        updateCache(newState)

        state = newState

        for (const listener of listeners) {
            listener()
        }
    }

    function updateCache(newState: EditorStoreState) {
        // we need to fix all caches where the entity is used.
        // fixing means clearing the cache because the mutation might have been more complex.
        const cachesAffected = [...newState.entities.values()]
            .filter(entity => entity !== state.entities.get(entity.id))
            .flatMap(entity => Object.keys(entity))
            .flatMap(componentName => componentInComponentCache.get(componentName) ?? [])
            .filter((value, index, self) => self.indexOf(value) === index)

        for (const cache of cachesAffected) {
            componentCache.delete(cache)
        }

        //        selected = newState.selected.map(id => newState.entities.get(id) as ImmutableEntity)
    }
}

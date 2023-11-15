import { applyPatches, enableMapSet, enablePatches, Immutable, Patch, produce } from "immer"
import { NarrowProperties } from "runtime-framework"
import { Entity, ImmutableEntity } from "../../entities/entity"
import { EntityBehaviors } from "../../entities/entity-behaviors"
import { WorldState } from "../world-state"
import { Gamemode } from "./gamemode"

enableMapSet()
enablePatches()

export interface EditorStoreWorld {
    subscribe(listener: () => void): () => void

    undo(): void
    redo(): void

    selected(): ImmutableEntity[]
    select(...id: number[]): void
    deselect(id?: number): void

    gamemodes(): Immutable<Gamemode[]>
    entities(): Map<number, ImmutableEntity>

    mutate(mutation: (state: WorldState) => void): void
}

export const createEditorStoreWorld = (): EditorStoreWorld => {
    // create our initial immutable entities map
    let state: WorldState = produce(
        {
            gamemodes: [],
            entities: new Map<number, Entity>(),
        },
        () => {},
    )

    const listeners = new Set<() => void>()

    const undos: Patch[][] = []
    const redos: Patch[][] = []

    // behaviors => entities. caching all entities with these specific behaviors.
    // unspecific types because value is dependent on key which is not describable in typescript for generics.
    // (especially when the key is a concatenation of multiple strings)
    const behaviorCache = new Map<string, ImmutableEntity[]>()

    // we want to fix the caches after an entity changed in it.
    // to know which caches have to be fixed we use a lookup table to see where a specific entity behaviors are used.
    const behaviorInBehaviorCache = new Map<PropertyKey, string[]>()

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
        gamemodes() {
            return state.gamemodes
        },
        entities() {
            return state.entities
        },
        entitiesWithBehaviors<T extends (keyof EntityBehaviors)[]>(...behaviorNames: T) {
            const joined = behaviorNames.sort().join(",")

            let cached = behaviorCache.get(joined)

            if (cached === undefined) {
                cached = []

                for (const entity of state.entities.values()) {
                    if (behaviorNames.every(behaviorName => behaviorName in entity)) {
                        cached.push(entity)
                    }
                }

                behaviorCache.set(joined, cached)

                for (const behaviorName of behaviorNames) {
                    let behaviorCacheKeys = behaviorInBehaviorCache.get(behaviorName)

                    if (behaviorCacheKeys === undefined) {
                        behaviorCacheKeys = []
                        behaviorInBehaviorCache.set(behaviorName, behaviorCacheKeys)
                    } else if (behaviorCacheKeys.includes(joined)) {
                        continue
                    }

                    behaviorCacheKeys.push(joined)
                }
            }

            return cached as ImmutableEntity<NarrowProperties<EntityBehaviors, T[number]>>[]
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

    function updateState(newState: WorldState) {
        updateCache(newState)

        state = newState

        for (const listener of listeners) {
            listener()
        }
    }

    function updateCache(newState: WorldState) {
        // we need to fix all caches where the entity is used.
        // fixing means clearing the cache because the mutation might have been more complex.
        const cachesAffected = [...newState.entities.values()]
            .filter(entity => entity !== state.entities.get(entity.id))
            .flatMap(entity => Object.keys(entity))
            .flatMap(behaviorName => behaviorInBehaviorCache.get(behaviorName) ?? [])
            .filter((value, index, self) => self.indexOf(value) === index)

        for (const cache of cachesAffected) {
            behaviorCache.delete(cache)
        }

        //        selected = newState.selected.map(id => newState.entities.get(id) as ImmutableEntity)
    }
}

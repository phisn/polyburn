import { applyPatches, enableMapSet, enablePatches, Patch, produce } from "immer"
import { NarrowProperties } from "runtime-framework"
import { Entity, entityHas, ImmutableEntity } from "./entity"
import { EntityComponents } from "./model-entities/entity-components"
import { Mutation } from "./mutation"

enableMapSet()
enablePatches()

export interface EntityStore<Components extends object = EntityComponents> {
    subscribe(listener: () => void): () => void

    undo(): void
    redo(): void

    entities(): Map<number, ImmutableEntity<Components>>

    entitiesWithComponents<T extends (keyof Components)[]>(
        ...componentNames: T
    ): ImmutableEntity<NarrowProperties<Components, T[number]>>[]

    mutate(mutation: Mutation<Components>): void
}

export const createStore = <
    Components extends object = EntityComponents,
>(): EntityStore<Components> => {
    let entities = new Map<number, Entity<Components>>()

    const listeners = new Set<() => void>()

    const undos: Patch[][] = []
    const redos: Patch[][] = []

    // components => entities. caching all entities with these specific components.
    // unspecific types because value is dependent on key which is not describable in typescript for generics.
    // (especially when the key is a concatenation of multiple strings)
    const componentCache = new Map<string, ImmutableEntity<Components>[]>()

    // we want to fix the caches after an entity changed in it.
    // to know which caches have to be fixed we use a lookup table to see where a specific entity components are used.
    const componentInComponentCache = new Map<PropertyKey, string[]>()

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
            updateEntities(applyPatches(entities, changes))
        },
        redo() {
            const changes = redos.pop()

            if (changes === undefined) {
                return
            }

            undos.push(changes)
            updateEntities(applyPatches(entities, changes))
        },
        entities() {
            return entities
        },
        entitiesWithComponents<T extends (keyof Components)[]>(...componentNames: T) {
            const joined = componentNames.join(",")

            let cached = componentCache.get(joined)

            if (cached === undefined) {
                cached = []

                for (const entity of entities.values()) {
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

            return cached as ImmutableEntity<NarrowProperties<Components, T[number]>>[]
        },
        mutate(mutation) {
            const changes: Patch[] = []
            const inverseChanges: Patch[] = []

            const newEntities = produce(entities, mutation, (patches, inversePatches) => {
                changes.push(...patches)
                inverseChanges.push(...inversePatches)
            })

            undos.push(inverseChanges)
            redos.length = 0

            updateEntities(newEntities)
        },
    }

    function updateEntities(newEntities: Map<number, Entity<Components>>) {
        const previousEntities = entities
        entities = newEntities

        notifySubscribers(entities, previousEntities)
    }

    function notifySubscribers(
        entities: Map<number, Entity<Components>>,
        previousEntities: Map<number, Entity<Components>>,
    ) {
        if (entities === previousEntities) {
            return
        }

        // we need to fix all caches where the entity is used.
        // fixing means clearing the cache because the mutation might have been more complex.
        const cachesAffected = [...entities.values()]
            .filter(entity => entity !== previousEntities.get(entity.id))
            .flatMap(entity => Object.keys(entity))
            .flatMap(componentName => componentInComponentCache.get(componentName) ?? [])
            .filter((value, index, self) => self.indexOf(value) === index)

        for (const cache of cachesAffected) {
            componentCache.delete(cache)
        }

        for (const listener of listeners) {
            listener()
        }
    }
}

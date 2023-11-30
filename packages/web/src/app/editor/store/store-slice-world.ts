import { applyPatches, enableMapSet, enablePatches, Immutable, Patch, produce } from "immer"
import { StateCreator } from "zustand"
import { Entity, ImmutableEntityWith } from "../entities/entity"
import { EntityBehaviors } from "../entities/entity-behaviors"
import { WorldState } from "./model/world-state"
import { EditorStore } from "./store"

enableMapSet()
enablePatches()

export interface StoreSliceWorld {
    entityCache: {
        componentsToEntities: Map<string, any>
        componentToComponents: Map<string, string>
    }

    undos: Patch[][]
    redos: Patch[][]

    world: Immutable<WorldState>

    entitiesWith<T extends (keyof EntityBehaviors)[]>(
        ...componentNames: T
    ): ImmutableEntityWith<T[number]>[]

    undo(): void
    redo(): void

    mutate(mutation: (state: WorldState) => void): void
}

function stateAfterChange(
    state: EditorStore,
    newWorld: Immutable<WorldState>,
): Partial<EditorStore> {
    const componentsAffected = [...newWorld.entities.values()]
        .filter(entity => entity !== newWorld.entities.get(entity.id))
        .flatMap(entity => Object.keys(entity))
        .filter((value, index, self) => self.indexOf(value) === index)

    const cachesAffected = componentsAffected
        .flatMap(name => state.entityCache.componentToComponents.get(name) ?? [])
        .filter((value, index, self) => self.indexOf(value) === index)

    const componentsToEntities = new Map(state.entityCache.componentsToEntities)
    const componentToComponents = new Map(state.entityCache.componentToComponents)

    cachesAffected.forEach(componentsToEntities.delete)
    componentsAffected.forEach(componentToComponents.delete)

    return {
        entityCache: {
            componentsToEntities,
            componentToComponents,
        },
        selected: state.selected.filter(id => newWorld.entities.has(id)),
    }
}

export const createStoreSliceWorld: StateCreator<EditorStore, [], [], StoreSliceWorld> = (
    set,
    get,
) => ({
    entityCache: {
        componentsToEntities: new Map(),
        componentToComponents: new Map(),
    },

    undos: [],
    redos: [],

    world: produce(
        {
            gamemodes: [],
            entities: new Map<number, Entity>(),
        },
        () => {},
    ),

    entitiesWith(...behaviors) {
        const key = behaviors.sort().join(":")
        const cached = get().entityCache.componentsToEntities.get(key)

        if (cached) {
            return cached
        }

        const entities = [...get().world.entities.values()].filter(entity =>
            behaviors.every(behavior => behavior in entity),
        )

        set(state => {
            const componentsToEntities = new Map(state.entityCache.componentsToEntities).set(
                key,
                entities,
            )

            const componentToComponents = new Map(state.entityCache.componentToComponents)

            for (const behavior of behaviors) {
                componentToComponents.set(behavior, key)
            }

            return {
                ...state,
                entityCache: {
                    componentsToEntities,
                    componentToComponents,
                },
            }
        })

        return entities
    },

    undo() {
        if (get().undos.length === 0) {
            return
        }

        set(state => {
            const [changes, ...others] = state.undos
            const world = applyPatches(state.world, changes)

            return {
                ...stateAfterChange(state, world),
                undos: [...others],
                redos: [changes, ...state.redos],
                world,
            }
        })
    },
    redo() {
        if (get().redos.length === 0) {
            return
        }

        set(state => {
            const [changes, ...others] = state.redos
            const world = applyPatches(state.world, changes)

            return {
                ...stateAfterChange(state, world),
                undos: [changes, ...state.undos],
                redos: [...others],
                world,
            }
        })
    },
    mutate(mutation) {
        set(state => {
            const changes: Patch[] = []
            const inverseChanges: Patch[] = []

            const world = produce(state.world, mutation, (patches, inversePatches) => {
                changes.push(...patches)
                inverseChanges.push(...inversePatches)
            })

            return {
                ...stateAfterChange(state, world),
                undos: [inverseChanges, ...state.undos],
                redos: [],
                world,
            }
        })
    },
})

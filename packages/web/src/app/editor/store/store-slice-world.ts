import { applyPatches, Immutable, Patch, produce } from "immer"
import { StateCreator } from "zustand"
import { Entity } from "../entities/entity"
import { WorldState } from "./model/world-state"
import { StoreSliceFocus } from "./store-slice-focus"

export interface StoreSliceWorld {
    undos: Patch[][]
    redos: Patch[][]

    world: Immutable<WorldState>

    undo(): void
    redo(): void

    mutate(mutation: (state: WorldState) => void): void
}

export const createStoreSliceWorld: StateCreator<
    StoreSliceFocus & StoreSliceWorld,
    [],
    [],
    StoreSliceWorld
> = (set, get) => ({
    undos: [],
    redos: [],

    world: produce(
        {
            gamemodes: [],
            entities: new Map<number, Entity>(),
        },
        () => {},
    ),
    undo() {
        if (get().undos.length === 0) {
            return
        }

        set(state => {
            const [changes, ...others] = state.undos
            const world = applyPatches(state.world, changes)

            return {
                undos: [...others],
                redos: [changes, ...state.redos],
                world,
                selected: state.selected.filter(id => world.entities.has(id)),
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
                undos: [changes, ...state.undos],
                redos: [...others],
                world: applyPatches(state.world, changes),
                selected: state.selected.filter(id => world.entities.has(id)),
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
                undos: [inverseChanges, ...state.undos],
                redos: [],
                world,
                selected: state.selected.filter(id => world.entities.has(id)),
            }
        })
    },
})

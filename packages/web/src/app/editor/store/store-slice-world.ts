import { applyPatches, Immutable, Patch, produce } from "immer"
import { StateCreator } from "zustand"
import { BehaviorHighlight } from "../behaviors/behaviors"
import { Entity } from "../entities/entity"
import { WorldState } from "./model/world-state"

export interface StoreSliceWorld {
    highlighted: BehaviorHighlight | undefined
    selected: number[]

    undos: Patch[][]
    redos: Patch[][]

    world: Immutable<WorldState>

    highlight(highlight: BehaviorHighlight | undefined): void
    select(...id: number[]): void
    deselect(id?: number): void

    selectedEntities(): Immutable<Entity>[]

    undo(): void
    redo(): void

    mutate(mutation: (state: WorldState) => void): void
}

export const createStoreSliceWorld: StateCreator<StoreSliceWorld> = (set, get) => ({
    highlighted: undefined,
    selected: [],

    undos: [],
    redos: [],

    world: produce(
        {
            gamemodes: [],
            entities: new Map<number, Entity>(),
        },
        () => {},
    ),

    highlight(highlighted) {
        set(state => ({
            ...state,
            highlighted,
        }))
    },

    select(...id) {
        set(state => {
            const selected = [...state.selected, ...id].filter((value, index, self) => {
                return self.indexOf(value) === index && state.world.entities.has(value)
            })

            return {
                ...state,
                selected,
            }
        })
    },
    deselect(id) {
        set(state => {
            const selected = state.selected.filter(value => value !== id)

            return {
                ...state,
                selected,
            }
        })
    },
    selectedEntities() {
        return get().selected.map(id => get().world.entities.get(id)!)
    },

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

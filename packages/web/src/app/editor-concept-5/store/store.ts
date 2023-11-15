import { Immutable, Patch, applyPatches, produce } from "immer"
import { create } from "zustand"
import { Entity } from "../entities/entity"
import { WorldState } from "./world-state"

export interface EditorStore {
    undos: Patch[][]
    redos: Patch[][]

    world: Immutable<WorldState>

    undo(): void
    redo(): void

    mutate(mutation: (state: WorldState) => void): void
}

export const createEditorStore = () =>
    create<EditorStore>((set, get) => ({
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

                return {
                    undos: [...others],
                    redos: [changes, ...state.redos],
                    world: applyPatches(state.world, changes),
                }
            })
        },
        redo() {
            if (get().redos.length === 0) {
                return
            }

            set(state => {
                const [changes, ...others] = state.redos

                return {
                    undos: [changes, ...state.undos],
                    redos: [...others],
                    world: applyPatches(state.world, changes),
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
                }
            })
        },
    }))

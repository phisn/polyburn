import { StateCreator } from "zustand"
import { BehaviorHighlight } from "../behaviors/behaviors"
import { StoreSliceWorld } from "./store-slice-world"

export interface StoreSliceFocus {
    highlighted: BehaviorHighlight | undefined
    selected: number[]

    highlight(highlight: BehaviorHighlight | undefined): void
    select(...id: number[]): void
    deselect(id?: number): void
}

export const createStoreSliceWorld: StateCreator<
    StoreSliceFocus & StoreSliceWorld,
    [],
    [],
    StoreSliceFocus
> = (set, get) => ({
    highlighted: undefined,
    selected: [],

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
})

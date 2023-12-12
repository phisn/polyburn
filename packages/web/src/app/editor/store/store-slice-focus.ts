import { StateCreator } from "zustand"
import { BehaviorHighlight } from "../behaviors/behaviors"
import { EditorStore } from "./store"

export interface StoreSliceFocus {
    highlighted: BehaviorHighlight | undefined
    selected: number[]

    highlight(highlight?: BehaviorHighlight): void
    select(...id: number[]): void
    deselect(id?: number): void
}

export const createStoreSliceFocus: StateCreator<EditorStore, [], [], StoreSliceFocus> = (
    set,
    get,
) => ({
    highlighted: undefined,
    selected: [],

    highlight(highlighted) {
        set(() => ({
            highlighted,
        }))
    },

    select(...id) {
        set(state => {
            const selected = [...state.selected, ...id].filter((value, index, self) => {
                return self.indexOf(value) === index && state.world.entities.has(value)
            })

            return {
                selected,
            }
        })
    },
    deselect(id) {
        set(state => {
            if (id === undefined) {
                return {
                    selected: [],
                }
            }

            const selected = state.selected.filter(value => value !== id)

            return {
                selected,
            }
        })
    },
    selectedEntities() {
        return get().selected.map(id => get().world.entities.get(id)!)
    },
})

import { ImmutableEntity } from "../entities/entity"
import { useEditorStore } from "./store"

export function useIsSelected(entity: ImmutableEntity | number) {
    let id = entity

    if (typeof id !== "number") {
        id = id.id
    }

    return useEditorStore(store => store.selected).includes(id)
}

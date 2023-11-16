import { ImmutableEntity } from "../entities/entity"
import { useEditorStore } from "./store"

export function useIsHighlighted(entity: ImmutableEntity | number) {
    let id = entity

    if (typeof id !== "number") {
        id = id.id
    }

    return useEditorStore(store => store.highlighted?.targetId === id)
}

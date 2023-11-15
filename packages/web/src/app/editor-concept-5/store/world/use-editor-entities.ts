import { useSyncExternalStore } from "react"
import { ImmutableEntity } from "../../entities/entity"
import { useEditorWorld } from "./EditorWorldProvider"

export function useEditorEntities<U>(selector: (entities: Map<number, ImmutableEntity>) => U) {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () => selector(store.entities()))
}

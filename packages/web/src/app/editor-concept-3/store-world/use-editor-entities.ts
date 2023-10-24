import { useSyncExternalStore } from "react"
import { useEditorWorld } from "./EditorWorldProvider"
import { ImmutableEntity } from "./models/entity"

export function useEditorEntities<U>(selector: (entities: Map<number, ImmutableEntity>) => U) {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () => selector(store.entities()))
}

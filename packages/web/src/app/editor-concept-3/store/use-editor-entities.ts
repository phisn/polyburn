import { useSyncExternalStore } from "react"
import { useEditorStore } from "./EditorStoreProvider"
import { ImmutableEntity } from "./entity"

export function useEditorEntities<U>(selector: (entities: Map<number, ImmutableEntity>) => U) {
    const store = useEditorStore()
    return useSyncExternalStore(store.subscribe, () => selector(store.entities()))
}

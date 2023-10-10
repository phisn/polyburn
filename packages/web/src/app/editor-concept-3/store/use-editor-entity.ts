import { useSyncExternalStore } from "react"
import { useEditorStore } from "./EditorStoreProvider"
import { ImmutableEntity } from "./entity"

export function useEditorEntities(entityId: number): ImmutableEntity | undefined {
    const store = useEditorStore()
    return useSyncExternalStore(store.subscribe, () => store.entities().get(entityId))
}

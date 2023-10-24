import { useSyncExternalStore } from "react"
import { useEditorWorld } from "./EditorWorldProvider"
import { ImmutableEntity } from "./models/entity"

export function useEditorEntities(entityId: number): ImmutableEntity | undefined {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () => store.entities().get(entityId))
}

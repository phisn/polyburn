import { useSyncExternalStore } from "react"
import { ImmutableEntity } from "../../entities/entity"
import { useEditorWorld } from "./EditorWorldProvider"

export function useEditorEntities(entityId: number): ImmutableEntity | undefined {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () => store.entities().get(entityId))
}

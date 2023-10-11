import { useSyncExternalStore } from "react"
import { NarrowProperties } from "runtime-framework"
import { useEditorStore } from "./EditorStoreProvider"
import { EntityComponents } from "./models-entities/entity-components"
import { Entity, Immutable } from "./models/entity"

export function useEditorEntitiesWith<T extends (keyof EntityComponents)[]>(
    ...componentNames: T
): Immutable<Entity<NarrowProperties<EntityComponents, T[number]>>[]> {
    const store = useEditorStore()
    return useSyncExternalStore(store.subscribe, () =>
        store.entitiesWithComponents(...componentNames),
    )
}

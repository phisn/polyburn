import { useSyncExternalStore } from "react"
import { NarrowProperties } from "runtime-framework"
import { useEditorWorld } from "./EditorWorldProvider"
import { EditorComponents } from "./models/editor-components"
import { Entity, Immutable } from "./models/entity"

export function useEditorEntitiesWith<T extends (keyof EditorComponents)[]>(
    ...componentNames: T
): Immutable<Entity<NarrowProperties<EditorComponents, T[number]>>[]> {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () =>
        store.entitiesWithComponents(...componentNames),
    )
}

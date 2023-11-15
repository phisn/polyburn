import { useSyncExternalStore } from "react"
import { NarrowProperties } from "runtime-framework"
import { ImmutableEntity } from "../../entities/entity"
import { EntityComponents } from "../../entities/entity-behaviors"
import { useEditorWorld } from "./EditorWorldProvider"

export function useEditorEntitiesWith<T extends (keyof EntityComponents)[]>(
    ...componentNames: T
): ImmutableEntity<NarrowProperties<EntityComponents, T[number]>>[] {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () =>
        store.entitiesWithComponents(...componentNames),
    )
}

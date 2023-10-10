import { useSyncExternalStore } from "react"
import { NarrowProperties } from "runtime-framework"
import { useEditorStore } from "./EditorStoreProvider"
import { ImmutableEntity } from "./entity"
import { EntityComponents } from "./model-entities/entity-components"

export function useEditorEntitiesWith<T extends (keyof EntityComponents)[]>(
    ...componentNames: T
): ImmutableEntity<NarrowProperties<EntityComponents, T[number]>>[] {
    const store = useEditorStore()
    return useSyncExternalStore(store.subscribe, () =>
        store.entitiesWithComponents(...componentNames),
    )
}

const store = useEditorStore()
const [first] = useEditorEntitiesWith("object")

store.mutate(entities => {
    entities.get(first.id)!.object!.position.x = 10
})

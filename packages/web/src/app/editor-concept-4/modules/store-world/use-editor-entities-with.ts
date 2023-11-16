import { useSyncExternalStore } from "react"
import { NarrowProperties } from "runtime-framework"
import { ImmutableEntity } from "../../entities/entity"
import { EntityBehaviors } from "../../entities/entity-behaviors"
import { useEditorWorld } from "./EditorWorldProvider"

export function useEditorEntitiesWith<T extends (keyof EntityBehaviors)[]>(
    ...componentNames: T
): ImmutableEntity<NarrowProperties<EntityBehaviors, T[number]>>[] {
    const store = useEditorWorld()
    return useSyncExternalStore(store.subscribe, () =>
        store.entitiesWithBehaviors(...componentNames),
    )
}

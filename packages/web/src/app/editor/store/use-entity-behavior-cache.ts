import { useEffect, useRef } from "react"
import { EntityBehaviors } from "../entities/entity-behaviors"
import { useEditorStore } from "./store"

type CacheFunction = <T extends (keyof EntityBehaviors)[]>(...componentNames: T) => void

export function useEntityBehaviorCache(): CacheFunction {
    interface Cache {
        entitiesForComponent: Map<string, any>
        component
    }

    const world = useEditorStore(store => store.world)

    const cacheRef = useRef<Cache>({
        entitiesForComponent: new Map(),
    })

    useEffect(() => {}, world)

    return (...behaviors) => {
        const key = behaviors.sort().join(":")
        const cached = cacheRef.current.entitiesForComponent.get(key)

        if (cached) {
            return cached
        }

        const entities = [...world.entities.values()].filter(entity =>
            behaviors.every(behavior => behavior in entity),
        )

        cacheRef.current.entitiesForComponent.set(key, entities)

        return entities
    }
}

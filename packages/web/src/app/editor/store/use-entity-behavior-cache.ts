import { useEffect, useRef } from "react"
import { EntityBehaviors } from "../entities/entity-behaviors"
import { useEditorStore } from "./store"

type CacheFunction = <T extends (keyof EntityBehaviors)[]>(...componentNames: T) => void

export function useEntityBehaviorCache(): CacheFunction {
    interface Cache {
        componentsToEntities: Map<string, any>
        componentToComponents: Map<string, string>
    }

    const world = useEditorStore(store => store.world)

    const cacheRef = useRef<Cache>({
        componentToEntities: new Map(),
    })

    useEffect(() => {}, world)

    return (...behaviors) => {
        const key = behaviors.sort().join(":")
        const cached = cacheRef.current.componentToEntities.get(key)

        if (cached) {
            return cached
        }

        const entities = [...world.entities.values()].filter(entity =>
            behaviors.every(behavior => behavior in entity),
        )

        cacheRef.current.componentToEntities.set(key, entities)
        cacheRef.current.componentToComponents.set(key, behaviors)

        return entities
    }
}

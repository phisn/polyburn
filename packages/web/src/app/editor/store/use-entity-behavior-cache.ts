import { useEffect, useRef } from "react"
import { ImmutableEntityWith } from "../entities/entity"
import { EntityBehaviors } from "../entities/entity-behaviors"
import { useEditorStore } from "./store"

export type EntityCache = <T extends (keyof EntityBehaviors)[]>(
    ...componentNames: T
) => ImmutableEntityWith<T[number]>[]

export function useEntityBehaviorCache(): EntityCache {
    interface Cache {
        componentsToEntities: Map<string, any>
        componentToComponents: Map<string, string>
    }

    const cacheRef = useRef<Cache>({
        componentsToEntities: new Map(),
        componentToComponents: new Map(),
    })

    const world = useEditorStore(store => store.world)
    const previousWorld = useRef(world)

    useEffect(() => {
        const componentsAffected = [...world.entities.values()]
            .filter(entity => entity !== previousWorld.current.entities.get(entity.id))
            .flatMap(entity => Object.keys(entity))
            .filter((value, index, self) => self.indexOf(value) === index)

        const cachesAffected = componentsAffected
            .flatMap(name => cacheRef.current.componentToComponents.get(name) ?? [])
            .filter((value, index, self) => self.indexOf(value) === index)

        cachesAffected.forEach(cacheRef.current.componentsToEntities.delete)
        componentsAffected.forEach(cacheRef.current.componentToComponents.delete)

        previousWorld.current = world
    }, [world])

    return (...behaviors) => {
        const key = behaviors.sort().join(":")
        const cached = cacheRef.current.componentsToEntities.get(key)

        if (cached) {
            return cached
        }

        const entities = [...world.entities.values()].filter(entity =>
            behaviors.every(behavior => behavior in entity),
        )

        cacheRef.current.componentsToEntities.set(key, entities)

        for (const behavior of behaviors) {
            cacheRef.current.componentToComponents.set(behavior, key)
        }

        return entities
    }
}

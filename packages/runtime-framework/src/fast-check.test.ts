import fc, { object } from "fast-check"
import { test } from "vitest"
import { createEntityStore, EntityStore } from "./entity-store"

interface ComponentA {
    value: number
}

interface ComponentB {
    value: number
    other: string
}

interface Components {
    test1?: ComponentA
    test2?: ComponentB
}

const arbitraryComponent = fc.oneof(
    fc.tuple(
        fc.record<ComponentA>({ value: fc.integer() }),
        fc.constant("test1" as keyof Components),
    ),
    fc.tuple(
        fc.record<ComponentB>({ value: fc.integer(), other: fc.string() }),
        fc.constant("test2" as keyof Components),
    ),
)

const arbitraryComponents = fc.uniqueArray(arbitraryComponent).map(components => {
    const result: Partial<Components> = {}

    for (const [component, componentName] of components) {
        result[componentName] = component as any
    }

    return result
})

const arbitraryEntities = fc.array(arbitraryComponents)

const arbitraryStore = arbitraryEntities.map(
    entities => {
        const store = createEntityStore<Components>()
        const { create: newEntity } = store

        for (const entity of entities) {
            newEntity(entity as any)
        }

        return store
    },
    store => {
        const isStore = (store: unknown): store is EntityStore<Components> =>
            store instanceof object && "entities" in store

        if (!isStore(store)) {
            throw new Error("Invalid store")
        }

        return [...store.entities.values()].map(entity => entity.components)
    },
)

test("Entity should exist in entities after create", () => {
    // should exist in entities after creation
    fc.assert(
        fc.property(arbitraryStore, arbitraryComponents, ({ create, entities }, components) =>
            entities.has(create(components as any).id),
        ),
    )
})

test("Entity should be findable in entities after create", () => {
    // should exist in entities after creation
    fc.assert(
        fc.property(
            arbitraryStore,
            arbitraryComponents,
            fc.nat(10),
            (store, components, amount) => {
                const entities = [...Array(amount)].map(() => store.create(components as any))
                const found = store.find(...(Object.keys(components) as (keyof Components)[]))

                return entities.every(entity => found.some(({ id }) => id === entity.id))
            },
        ),
    )
})

test("Amount of entities is correct", () => {
    // should exist in entities after creation
    fc.assert(
        fc.property(
            arbitraryStore,
            arbitraryComponents,
            fc.nat(10),
            (store, components, amount) => {
                const previousSize = store.entities.size

                for (let i = 0; i < amount; i++) {
                    store.create(components as any)
                }

                return store.entities.size === previousSize + amount
            },
        ),
    )
})

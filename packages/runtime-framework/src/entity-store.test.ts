import { expect, test } from "vitest"

import { EmptyComponent, Entity } from "./entity"
import { createEntityStore } from "./entity-store"

test("RuntimeStore entity", () => {
    interface Component {
        value: number
    }

    interface Components {
        test1?: Component
        test2?: Component
    }

    const store = createEntityStore<Components>()
    const { create: newEntity } = store

    const entity = newEntity({
        test1: { value: 8 },
    })

    entity.components.test1.value += 9

    expect(entity.components.test1.value).toBe(17)
    expect(entity.components.test2?.value).toBeUndefined()

    expect(Object.keys(entity.components).length).toBe(1)

    expect("test1" in entity.components).toBe(true)
    expect("test2" in entity.components).toBe(false)

    entity.components.test2 = { value: 8 }
})

test("RuntimeStore entity set", () => {
    interface Component {
        value: number
    }

    interface Components {
        test1?: Component
        test2?: Component
        test3?: Component
    }

    const store = createEntityStore<Components>()
    const { create: newEntity, remove: removeEntity, entities } = store

    newEntity({
        test1: { value: 1 },
        test2: { value: 2 },
    })

    const c1 = newEntity({
        test1: { value: 3 },
        test2: { value: 4 },
    })

    for (let index = 0; index < 20; index++) {
        newEntity()
    }

    const c2 = newEntity({ test1: { value: 1 } })
    const c3 = newEntity({ test2: { value: 1 } })
    const c4 = newEntity()
    const c5: Entity<Components> = newEntity()

    const set1 = store.newSet("test2")
    const set2 = store.newSet("test1", "test2")
    const set3 = store.newSet("test1")
    const set4 = store.newSet("test3")
    const set5 = store.newSet()

    newEntity({
        test1: { value: 5 },
        test2: { value: 6 },
    })

    for (let index = 0; index < 20; index++) {
        newEntity()
    }

    expect([...set1].length).toBe(4)
    expect([...set2].length).toBe(3)
    expect([...set3].length).toBe(4)
    expect([...set4].length).toBe(0)
    expect([...set5].length).toBe(47 + 1)

    delete (c1 as Entity<Components>).components.test1
    delete (c2 as Entity<Components>).components.test1

    expect([...set1].length).toBe(4)
    expect([...set2].length).toBe(2)
    expect([...set3].length).toBe(2)
    expect([...set4].length).toBe(0)

    c1.components.test1 = { value: 1 }
    c2.components.test1 = { value: 1 }
    c4.components.test3 = { value: 1 }

    expect([...set1].length).toBe(4)
    expect([...set2].length).toBe(3)
    expect([...set3].length).toBe(4)
    expect([...set4].length).toBe(1)

    removeEntity(c1.id)
    removeEntity(c2.id)
    removeEntity(c3.id)
    removeEntity(c4.id)
    removeEntity(c5.id)

    expect([...set1].length).toBe(2)
    expect([...set2].length).toBe(2)
    expect([...set3].length).toBe(2)
    expect([...set4].length).toBe(0)
    expect([...set5].length).toBe(42 + 1)

    expect(entities.size).toBe(42 + 1)
})

test("RuntimeStore test entity with undefined component", () => {
    interface Component {
        value: number
    }

    interface Components {
        test1?: Component
        test2?: EmptyComponent
        test3?: EmptyComponent
    }

    const store = createEntityStore<Components>()
    const { create: newEntity, newSet: newEntitySet } = store

    newEntity({ test1: { value: 5 }, test2: {} })
    newEntity({ test1: { value: 5 }, test2: {} })
    const c1 = newEntity({ test2: {} })
    newEntity({ test1: { value: 5 }, test3: {} })
    newEntity({ test3: {} })

    const set = newEntitySet("test2")

    expect([...set].length).toBe(3)

    newEntity({ test1: { value: 5 }, test2: {} })
    newEntity({ test1: { value: 5 }, test2: {} })
    const c2 = newEntity({ test2: {} })
    newEntity({ test1: { value: 5 }, test3: {} })
    newEntity({ test3: {} })

    expect([...set].length).toBe(6)

    delete (c1.components as Components).test2

    expect([...set].length).toBe(5)

    delete (c2.components as Components).test2

    expect([...set].length).toBe(4)
})

/*
test("RuntimeStore systems", () => {
    interface CounterComponent {
        value: number
    }

    const store = createEntityStore()
    const { newEntity, newEntitySet } = store.getState()

    const counterEntities = newEntitySet("counter")

    const incrementSystem = () => {
        for (const entity of counterEntities) {
            const counter = entity.getSafe<CounterComponent>("counter")
            counter.value++
        }
    }

    const decrementSystem = () => {
        for (const entity of counterEntities) {
            const counter = entity.getSafe<CounterComponent>("counter")
            counter.value--
            counter.value--
        }
    }

    const systemStack1 = new SystemStack<void, void>(store, void 0).add(
        () => incrementSystem
    )

    const systemStack2 = new SystemStack<void, void>(store, void 0).add(
        () => incrementSystem,
        () => decrementSystem
    )
    
    const c1 = newEntity().set<CounterComponent>("counter", { value: 0 })
    systemStack1.step()
    const c2 = newEntity().set<CounterComponent>("counter", { value: 0 })

    expect([...counterEntities].length).toBe(2)
    expect(c1.get<CounterComponent>("counter")?.value).toBe(1)
    expect(c2.get<CounterComponent>("counter")?.value).toBe(0)

    for (let i = 0; i < 200; i++) { systemStack1.step() }

    expect(c1.get<CounterComponent>("counter")?.value).toBe(201)
    expect(c2.get<CounterComponent>("counter")?.value).toBe(200)

    for (let i = 0; i < 200; i++) { systemStack2.step() }

    expect(c1.get<CounterComponent>("counter")?.value).toBe(1)
    expect(c2.get<CounterComponent>("counter")?.value).toBe(0)
})
 */

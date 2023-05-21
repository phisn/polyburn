import { expect, test } from "vitest"

import { createRuntimeStore } from "./RuntimeStore"

test("RuntimeStore entity", () => {
    const store = createRuntimeStore()
    const { newEntity } = store.getState()

    const entity = newEntity()

    interface Component {
        value: number
    }

    entity
        .addComponent<Component>("test1", { value: 1 })
        .addComponent<Component>("test2", { value: 2 })

    expect(entity.getComponent<Component>("test1").value).toBe(1)
    expect(entity.getComponent<Component>("test2").value).toBe(2)

    entity.removeComponent("test1")

    expect(entity.getComponent<Component>("test1")).toBeUndefined()
    expect(entity.getComponent<Component>("test2").value).toBe(2)

    expect(Object.keys(entity.components).length).toBe(1)
    expect("test2" in entity.components).toBe(true)
})

test("RuntimeStore entity set", () => {
    const store = createRuntimeStore()
    const { newEntity, removeEntity } = store.getState()

    interface Component {
        value: number
    }

    newEntity()
        .addComponent<Component>("test1", { value: 1 })
        .addComponent<Component>("test2", { value: 2 })

    const c1 = newEntity()
        .addComponent<Component>("test1", { value: 3 })
        .addComponent<Component>("test2", { value: 4 })

    for (let i = 0; i < 20; i++) { newEntity() }

    const c2 = newEntity().addComponent<Component>("test1", { value: 1 })
    const c3 = newEntity().addComponent<Component>("test2", { value: 1 })
    const c4 = newEntity()
    const c5 = newEntity()

    const set1 = store.getState().newEntitySet("test2")
    const set2 = store.getState().newEntitySet("test1", "test2")
    const set3 = store.getState().newEntitySet("test1")
    const set4 = store.getState().newEntitySet("test3")

    newEntity()
        .addComponent<Component>("test1", { value: 5 })
        .addComponent<Component>("test2", { value: 6 })

    for (let i = 0; i < 20; i++) { newEntity() }

    expect([...set1].length).toBe(4)
    expect([...set2].length).toBe(3)
    expect([...set3].length).toBe(4)
    expect([...set4].length).toBe(0)

    c1.removeComponent("test1")
    c2.removeComponent("test1")

    expect([...set1].length).toBe(4)
    expect([...set2].length).toBe(2)
    expect([...set3].length).toBe(2)
    expect([...set4].length).toBe(0)

    c1.addComponent<Component>("test1", { value: 1 })
    c2.addComponent<Component>("test1", { value: 1 })
    c4.addComponent<Component>("test3", { value: 1 })

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

    expect(store.getState().entities.size).toBe(42)
})

test("RuntimeStore systems", () => {
    interface CounterComponent {
        value: number
    }

    const store = createRuntimeStore()
    const { newEntity, newEntitySet, addSystem } = store.getState()

    const counterEntities = newEntitySet("counter")

    const incrementSystem = () => {
        for (const entity of counterEntities) {
            const counter = entity.getComponent<CounterComponent>("counter")
            counter.value++
        }
    }

    const decrementSystem = () => {
        for (const entity of counterEntities) {
            const counter = entity.getComponent<CounterComponent>("counter")
            counter.value--
            counter.value--
        }
    }

    addSystem(incrementSystem)

    const step = () => {
        store.getState().systems.forEach(system => system())
    }

    const c1 = newEntity().addComponent<CounterComponent>("counter", { value: 0 })
    step()
    const c2 = newEntity().addComponent<CounterComponent>("counter", { value: 0 })

    expect([...counterEntities].length).toBe(2)
    expect(c1.getComponent<CounterComponent>("counter").value).toBe(1)
    expect(c2.getComponent<CounterComponent>("counter").value).toBe(0)

    for (let i = 0; i < 200; i++) { step() }

    expect(c1.getComponent<CounterComponent>("counter").value).toBe(201)
    expect(c2.getComponent<CounterComponent>("counter").value).toBe(200)

    addSystem(decrementSystem)

    for (let i = 0; i < 200; i++) { step() }

    expect(c1.getComponent<CounterComponent>("counter").value).toBe(1)
    expect(c2.getComponent<CounterComponent>("counter").value).toBe(0)
})

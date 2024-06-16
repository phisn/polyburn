import { beforeEach, describe, expect, it } from "vitest"
import { EntityStore, newEntityStore2 } from "./entity"

interface Components {
    position: { x: number; y: number }
    velocity: { dx: number; dy: number }
    health: { hp: number }
}

let store: EntityStore<Components>

beforeEach(() => {
    store = newEntityStore2<Components>()
})

describe("EntityStore", () => {
    /*
    it("should create and retrieve a single entity with specified components", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const retrieved = store.single("position")
        expect(retrieved.position).toEqual(entity.position)
    })

    it("should throw an error when single is accessed with no entities", () => {
        const single = store.single("position")
        expect(() => single.position).toThrow()
    })

    it("should throw an error when single is accessed with multiple entities", () => {
        store.create({ position: { x: 0, y: 0 } })
        store.create({ position: { x: 1, y: 1 } })

        const single = store.single("position")
        expect(() => single.position).toThrow()
    })

    it("should create and retrieve multiple entities with specified components", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const retrieved = store.multiple("position")
        expect(retrieved.size).toBe(2)
        expect([...retrieved][0].position).toEqual(entity1.position)
        expect([...retrieved][1].position).toEqual(entity2.position)
    })

    it("should update multiple entities list when new entity is created", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const retrieved = store.multiple("position")
        expect(retrieved.size).toBe(1)
        expect([...retrieved][0].position).toEqual(entity1.position)

        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const newRetrieved = store.multiple("position")

        expect(newRetrieved).toBe(retrieved)

        expect(newRetrieved.size).toBe(2)
        expect([...newRetrieved][0].position).toEqual(entity1.position)
        expect([...newRetrieved][1].position).toEqual(entity2.position)

        expect(retrieved.size).toBe(2)
        expect([...retrieved][0].position).toEqual(entity1.position)
        expect([...retrieved][1].position).toEqual(entity2.position)

        expect(retrieved).toBe(newRetrieved)
    })

    it("should update multiple entities list when an entity is removed", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const retrieved = store.multiple("position")

        expect(retrieved.size).toBe(2)
        expect([...retrieved][0].position).toEqual(entity1.position)
        expect([...retrieved][1].position).toEqual(entity2.position)

        store.remove(entity1)

        const newRetrieved = store.multiple("position")
        expect(newRetrieved).toBe(retrieved)

        expect(retrieved.size).toBe(1)
        expect([...retrieved][0].position).toEqual(entity2.position)
    })

    it("should allow setting components for an entity", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        store.create({ velocity: { dx: 1, dy: 1 } })

        entity.velocity = { dx: 2, dy: 2 }
        const retrieved = store.single("position", "velocity")
        expect(retrieved.position).toEqual(entity.position)
        expect(retrieved.velocity).toEqual(entity.velocity)
    })

    it("should update single entity reference after creation or removal", () => {
        const single = store.single("position")
        expect(() => single.position).toThrow()

        let entity = store.create({ position: { x: 0, y: 0 } })

        expect(() => single.position).not.toThrow()
        expect(single.position).toEqual({ x: 0, y: 0 })

        store.remove(entity)

        expect(() => single.position).toThrow()

        entity = store.create({ position: { x: 1, y: 1 } })

        expect(() => single.position).not.toThrow()
        expect(single.position).toEqual({ x: 1, y: 1 })

        store.remove(single)

        expect(() => single.position).toThrow()
    })

    it("should handle multiple components correctly on a single entity", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })

        const multiple = [
            store.multiple("position", "velocity"),
            store.multiple("position"),
            store.multiple("velocity"),
            store.multiple("position", "velocity", "not-health"),
        ]

        console.log(multiple)

        for (const retrieved of multiple) {
            expect(retrieved.size).toBe(1)
            expect([...retrieved][0].position).toBeDefined()
            expect([...retrieved][0].velocity).toBeDefined()
        }

        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })

        for (const retrieved of multiple) {
            expect(retrieved.size).toBe(2)
            expect([...retrieved][0].position).toBeDefined()
            expect([...retrieved][0].velocity).toBeDefined()
        }
    })

    it("should handle creation and removal of hundreds of entities with random interactions", () => {
        const entities: EntityWith<Components, keyof Components>[] = []

        // Create 500 entities with random components
        for (let i = 0; i < 500; i++) {
            const entity = store.create({
                position: { x: Math.random() * 100, y: Math.random() * 100 },
                velocity: { dx: Math.random() * 10, dy: Math.random() * 10 },
                health: { hp: Math.floor(Math.random() * 100) },
            })
            entities.push(entity)
        }

        // Randomly remove 250 entities
        for (let i = 0; i < 250; i++) {
            const index = Math.floor(Math.random() * entities.length)
            const entity = entities.splice(index, 1)[0]
            store.remove(entity)
        }

        // Verify the remaining entities
        const remainingEntities = store.multiple("position", "velocity", "health")
        expect(remainingEntities.size).toBe(250)

        // Perform random updates on remaining entities
        remainingEntities.forEach(entity => {
            if (Math.random() > 0.5) {
                entity.position = { x: Math.random() * 100, y: Math.random() * 100 }
            }
            if (Math.random() > 0.5) {
                entity.velocity = { dx: Math.random() * 10, dy: Math.random() * 10 }
            }
            if (Math.random() > 0.5) {
                entity.health = { hp: Math.floor(Math.random() * 100) }
            }
        })

        // Verify updates
        remainingEntities.forEach(entity => {
            expect(entity.position).toBeDefined()
            expect(entity.velocity).toBeDefined()
            expect(entity.health).toBeDefined()
        })
    })

    it("should retrieve entities that do not have a specified component", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })
        const _entity3 = store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 50 } })

        const retrieved = store.multiple("not-velocity")

        expect(retrieved.size).toBe(1)
        expect([...retrieved][0].position).toEqual(entity2.position)
        expect([...retrieved][0].health).toEqual(entity2.health)
    })

    it("should retrieve entities with multiple specified components and absence of others", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })
        const _entity3 = store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 50 } })

        const retrieved = store.multiple("position", "not-velocity")

        expect(retrieved.size).toBe(1)
        expect([...retrieved][0].position).toEqual(entity2.position)
        expect([...retrieved][0].health).toEqual(entity2.health)
    })

    it("should retrieve a single entity with a specified component and absence of another", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })

        const retrieved = store.single("position", "not-velocity")

        expect(retrieved.position).toEqual(entity2.position)
        expect(retrieved.health).toEqual(entity2.health)
    })

    it("should throw an error when multiple entities match single with a specified component and absence of another", () => {
        store.create({ position: { x: 0, y: 0 }, health: { hp: 50 } })
        store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })

        const single = store.single("position", "not-velocity")
        expect(() => single.position).toThrow()
    })

    it("should throw an error when no entities match single with a specified component and absence of another", () => {
        store.create({ velocity: { dx: 1, dy: 1 }, health: { hp: 50 } })

        const single = store.single("position", "not-velocity")
        expect(() => single.position).toThrow()
    })
    */

    it("should allow singles with only negative", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })

        const single = store.single("not-velocity")
        expect(single.position).toEqual(entity.position)

        const single2 = store.single("not-health")
        const entity2 = store.create({ velocity: { dx: 1, dy: 1 } })

        expect(() => single2.position).toThrow()
        expect(() => single2.velocity).toThrow()

        expect(single.position).toEqual(entity.position)

        entity.health = { hp: 100 }

        expect(single.position).toEqual(entity.position)
        expect(single2.velocity).toEqual(entity2.velocity)
    })

    return

    it("should record entities changing correctly", () => {
        store.create({ position: { x: 0, y: 0 } })
        const a = store.create({ position: { x: 1, y: 1 }, velocity: { dx: 1, dy: 1 } })

        const changing = store.changing("position")
        const changes = changing()

        const changing2 = store.changing("not-velocity")

        console.log(changes)

        expect(changes.added.size).toBe(2)
        expect(changes.removed.size).toBe(0)
        expect([...changes.added][0].position).toEqual({ x: 0, y: 0 })
        expect([...changes.added][1].position).toEqual({ x: 1, y: 1 })

        const b = store.create({ position: { x: 2, y: 2 } })
        store.create({ position: { x: 3, y: 3 }, velocity: { dx: 3, dy: 3 } })

        const newChanges = changing()

        expect(newChanges.added.size).toBe(2)
        expect(newChanges.removed.size).toBe(0)
        expect([...newChanges.added][0].position).toEqual({ x: 2, y: 2 })
        expect([...newChanges.added][1].position).toEqual({ x: 3, y: 3 })

        store.remove(a)
        store.remove(b)

        const removedChanges = changing()

        expect(removedChanges.added.size).toBe(0)
        expect(removedChanges.removed.size).toBe(2)
        expect([...removedChanges.removed][0].position).toEqual({ x: 1, y: 1 })
        expect([...removedChanges.removed][1].position).toEqual({ x: 2, y: 2 })

        const changes2 = changing2()

        /*
        expect(changes2.size).toBe(3)
        expect([...changes2][0].type).toBe("created")
        expect([...changes2][0].entity.position).toEqual({ x: 0, y: 0 })
        expect([...changes2][1].type).toBe("created")
        expect([...changes2][1].entity.position).toEqual({ x: 2, y: 2 })
        expect([...changes2][2].type).toBe("removed")
        expect([...changes2][2].entity.position).toEqual({ x: 2, y: 2 })
        */

        expect(changes2.added.size).toBe(2)
        expect(changes2.removed.size).toBe(1)
        expect([...changes2.added][0].position).toEqual({ x: 0, y: 0 })
        expect([...changes2.added][1].position).toEqual({ x: 3, y: 3 })
        expect([...changes2.removed][0].position).toEqual({ x: 1, y: 1 })
    })
})

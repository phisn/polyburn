import { beforeEach, describe, expect, it } from "vitest"
import { Entity, EntityStore, EntityWith, newEntityStore } from "./entity"

interface Components {
    position: { x: number; y: number }
    velocity: { dx: number; dy: number }
    health: { hp: number }
}

let store: EntityStore<Components>

beforeEach(() => {
    store = newEntityStore<Components>()
})

describe("EntityStore", () => {
    it("should create and retrieve a single entity with specified components", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const retrieved = store.single("position")
        expect(retrieved.get("position")).toEqual(entity.get("position"))
        expect(retrieved.get("position")).toEqual({ x: 0, y: 0 })
    })

    it("should create and retrieve a single entity with specified not components", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const retrieved = store.single("not-velocity")
        expect(retrieved.has("position") && retrieved.get("position")).toEqual(
            entity.get("position"),
        )
        expect(retrieved.has("position") && retrieved.get("position")).toEqual({ x: 0, y: 0 })
    })

    it("should throw an error when single is accessed with no entities", () => {
        const single = store.single("position")
        expect(() => single.get("position")).toThrow()
    })

    it("should throw an error when single is accessed with multiple entities", () => {
        store.create({ position: { x: 0, y: 0 } })
        store.create({ position: { x: 1, y: 1 } })

        const single = store.single("position")
        expect(() => single.get("position")).toThrow()
    })

    it("should create and retrieve multiple entities with specified components", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const retrieved = store.multiple("position")
        //        console.log(retrieved[0])
        expect(retrieved.length).toBe(2)
        expect(retrieved[0].get("position")).toEqual(entity1.get("position"))
        expect(retrieved[1].get("position")).toEqual(entity2.get("position"))
    })

    it("should update multiple entities list when new entity is created", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const retrieved = store.multiple("position")
        expect(retrieved.length).toBe(1)
        expect(retrieved[0].get("position")).toEqual(entity1.get("position"))

        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const newRetrieved = store.multiple("position")

        expect(newRetrieved).toBe(retrieved)

        expect(retrieved.length).toBe(2)
        expect([...newRetrieved][0].get("position")).toEqual(entity1.get("position"))
        expect([...newRetrieved][1].get("position")).toEqual(entity2.get("position"))

        expect(retrieved.length).toBe(2)
        expect(retrieved[0].get("position")).toEqual(entity1.get("position"))
        expect(retrieved[1].get("position")).toEqual(entity2.get("position"))

        expect(retrieved).toBe(newRetrieved)
    })

    it("should update multiple entities list when an entity is removed", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const retrieved = store.multiple("position")

        expect(retrieved.length).toBe(2)
        expect(retrieved[0].get("position")).toEqual(entity1.get("position"))
        expect(retrieved[1].get("position")).toEqual(entity2.get("position"))

        store.remove(entity1)

        const newRetrieved = store.multiple("position")
        expect(newRetrieved).toBe(retrieved)

        expect(retrieved.length).toBe(1)
        expect(retrieved[0].get("position")).toEqual(entity2.get("position"))
    })

    it("should allow setting components for an entity", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        store.create({ velocity: { dx: 1, dy: 1 } })

        const newEntity = entity.set("velocity", { dx: 2, dy: 2 })
        const retrieved = store.single("position", "velocity")
        expect(retrieved.get("position")).toEqual(entity.get("position"))
        expect(retrieved.get("velocity")).toEqual(newEntity.get("velocity"))
        expect(retrieved.get("velocity")).toEqual(entity.has("velocity") && entity.get("velocity"))
    })

    it("should update single entity reference after creation or removal", () => {
        const single = store.single("position")
        expect(() => single.get("position")).toThrow()

        let entity = store.create({ position: { x: 0, y: 0 } })

        expect(() => single.get("position")).not.toThrow()
        expect(single.get("position")).toEqual({ x: 0, y: 0 })

        store.remove(entity)

        expect(() => single.get("position")).toThrow()

        entity = store.create({ position: { x: 1, y: 1 } })

        expect(() => single.get("position")).not.toThrow()
        expect(single.get("position")).toEqual({ x: 1, y: 1 })

        store.remove(single)

        expect(() => single.get("position")).toThrow()
    })

    it("should handle multiple components correctly on a single entity", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })

        const multiple = [
            store.multiple("position", "velocity"),
            store.multiple("position"),
            store.multiple("velocity"),
            store.multiple("position", "velocity", "not-health"),
        ]

        for (const retrieved of multiple) {
            const [one]: readonly Entity<any, Components>[] = retrieved

            expect(retrieved.length).toBe(1)
            expect(one.get("position")).toBeDefined()
            expect(one.get("velocity")).toBeDefined()
        }

        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })

        for (const retrieved of multiple) {
            const [one]: readonly Entity<any, Components>[] = retrieved

            expect(retrieved.length).toBe(2)
            expect(one.get("position")).toBeDefined()
            expect(one.get("velocity")).toBeDefined()
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
        expect([...remainingEntities].length).toBe(250)

        // Perform random updates on remaining entities
        ;[...remainingEntities].forEach(entity => {
            if (Math.random() > 0.5) {
                entity.set("position", { x: Math.random() * 100, y: Math.random() * 100 })
            }
            if (Math.random() > 0.5) {
                entity.set("velocity", { dx: Math.random() * 10, dy: Math.random() * 10 })
            }
            if (Math.random() > 0.5) {
                entity.set("health", { hp: Math.floor(Math.random() * 100) })
            }
        })

        // Verify updates
        ;[...remainingEntities].forEach(entity => {
            expect(entity.get("position")).toBeDefined()
            expect(entity.get("velocity")).toBeDefined()
            expect(entity.get("health")).toBeDefined()
        })
    })

    it("should retrieve entities that do not have a specified component", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })
        const _entity3 = store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 50 } })

        const retrieved = store.multiple("not-velocity")
        const [one] = retrieved

        expect(retrieved.length).toBe(1)
        expect(one.has("position") && one.get("position")).toEqual(entity2.get("position"))
        expect(one.has("health") && one.get("health")).toEqual(entity2.get("health"))
    })

    it("should retrieve entities with multiple specified components and absence of others", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })
        const _entity3 = store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 50 } })

        const retrieved = store.multiple("position", "not-velocity")
        const [one] = retrieved

        expect(retrieved.length).toBe(1)
        expect(one.get("position")).toEqual(entity2.get("position"))
        expect(one.has("health") && one.get("health")).toEqual(entity2.get("health"))
    })

    it("should retrieve a single entity with a specified component and absence of another", () => {
        const _entity1 = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })

        const retrieved = store.single("position", "not-velocity")

        expect(retrieved.get("position")).toEqual(entity2.get("position"))
        expect(retrieved.has("health") && retrieved.get("health")).toEqual(entity2.get("health"))
    })

    it("should throw an error when multiple entities match single with a specified component and absence of another", () => {
        store.create({ position: { x: 0, y: 0 }, health: { hp: 50 } })
        store.create({ position: { x: 1, y: 1 }, health: { hp: 100 } })

        const single = store.single("position", "not-velocity")
        expect(() => single.get("position")).toThrow()
    })

    it("should throw an error when no entities match single with a specified component and absence of another", () => {
        store.create({ velocity: { dx: 1, dy: 1 }, health: { hp: 50 } })

        const single = store.single("position", "not-velocity")
        expect(() => single.get("position")).toThrow()
    })

    it("should allow singles with only negative", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })

        const single = store.single("not-velocity")
        expect(single.has("position") && single.get("position")).toEqual(entity.get("position"))

        const single2 = store.single("not-health")
        const entity2 = store.create({ velocity: { dx: 1, dy: 1 } })

        expect(() => single2.has("position") && single2.get("position")).toThrow()
        expect(() => single2.has("velocity") && single2.get("velocity")).toThrow()

        expect(single.has("position") && single.get("position")).toEqual(entity.get("position"))

        entity.set("health", { hp: 100 })

        expect(single.has("position") && single.get("position")).toEqual(entity.get("position"))
        expect(single2.has("velocity") && single2.get("velocity")).toEqual(entity2.get("velocity"))
    })

    it("should handle entity removal and addition within the same operation", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const _entity2 = store.create({ position: { x: 1, y: 1 } })

        store.remove(entity1)
        const _entity3 = store.create({ position: { x: 2, y: 2 } })

        const retrieved = store.multiple("position")
        expect(retrieved.length).toBe(2)
        expect(retrieved[0].get("position")).toEqual({ x: 1, y: 1 })
        expect(retrieved[1].get("position")).toEqual({ x: 2, y: 2 })
    })

    it("should maintain correct entity order after multiple removals and additions", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        const _entity3 = store.create({ position: { x: 2, y: 2 } })

        store.remove(entity2)
        const _entity4 = store.create({ position: { x: 3, y: 3 } })
        store.remove(entity1)
        const _entity5 = store.create({ position: { x: 4, y: 4 } })

        const retrieved = store.multiple("position")
        expect(retrieved.length).toBe(3)
        expect(retrieved[0].get("position")).toEqual({ x: 2, y: 2 })
        expect(retrieved[1].get("position")).toEqual({ x: 3, y: 3 })
        expect(retrieved[2].get("position")).toEqual({ x: 4, y: 4 })
    })

    it("should handle component removal correctly", () => {
        const entity = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        entity.delete("velocity")

        expect(entity.has("position")).toBe(true)
        expect(entity.has("velocity")).toBe(false)
        expect(() => entity.get("velocity")).toThrow()
    })

    it("should update multiple queries when a component is removed from an entity", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 }, velocity: { dx: 2, dy: 2 } })

        const withBoth = store.multiple("position", "velocity")
        const withPosition = store.multiple("position")

        expect(withBoth.length).toBe(2)
        expect(withPosition.length).toBe(2)

        entity2.delete("velocity")

        expect(withBoth.length).toBe(1)
        expect(withPosition.length).toBe(2)
    })

    it("should handle component addition correctly", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const entityWithVelocity = entity.set("velocity", { dx: 1, dy: 1 })

        expect(entity.has("position")).toBe(true)
        expect(entity.has("velocity")).toBe(true)
        expect(entityWithVelocity.get("velocity")).toEqual({ dx: 1, dy: 1 })
    })

    it("should update multiple queries when a new component is added to an entity", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })

        const withBoth = store.multiple("position", "velocity")
        const withPosition = store.multiple("position")

        expect(withBoth.length).toBe(1)
        expect(withPosition.length).toBe(2)

        entity2.set("velocity", { dx: 2, dy: 2 })

        expect(withBoth.length).toBe(2)
        expect(withPosition.length).toBe(2)
    })

    it("should handle overwriting existing components", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        entity.set("position", { x: 1, y: 1 })

        expect(entity.get("position")).toEqual({ x: 1, y: 1 })
    })

    it("should maintain correct single entity reference after component overwrite", () => {
        store.create({ position: { x: 0, y: 0 } })
        const single = store.single("position")

        single.set("position", { x: 1, y: 1 })

        expect(single.get("position")).toEqual({ x: 1, y: 1 })
    })

    it("should handle entities with multiple 'not' components correctly", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        store.create({ position: { x: 1, y: 1 } })
        store.create({ velocity: { dx: 2, dy: 2 } })

        const retrieved = store.multiple("not-position", "not-velocity")
        expect(retrieved.length).toBe(0)
    })

    it("should correctly update queries with 'not' components when components are added or removed", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        store.create({ velocity: { dx: 1, dy: 1 } })

        const notVelocity = store.multiple("not-velocity")
        expect(notVelocity.length).toBe(1)

        entity1.set("velocity", { dx: 2, dy: 2 })
        expect(notVelocity.length).toBe(0)

        entity1.delete("velocity")
        expect(notVelocity.length).toBe(1)
    })

    it("should handle complex queries with multiple 'not' and regular components", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 }, health: { hp: 100 } })
        store.create({ position: { x: 1, y: 1 }, health: { hp: 50 } })
        store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 75 } })

        const retrieved = store.multiple("position", "health", "not-velocity")
        expect(retrieved.length).toBe(1)
        expect(retrieved[0].get("position")).toEqual({ x: 1, y: 1 })
        expect(retrieved[0].get("health")).toEqual({ hp: 50 })
    })

    it("should maintain consistency between single and multiple queries", () => {
        store.create({ position: { x: 0, y: 0 } })

        const single = store.single("position")
        const multiple = store.multiple("position")

        expect(single.get("position")).toEqual(multiple[0].get("position"))

        single.set("position", { x: 1, y: 1 })

        expect(single.get("position")).toEqual(multiple[0].get("position"))
    })

    it("should handle removal of all entities", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })

        store.remove(entity1)
        store.remove(entity2)

        const retrieved = store.multiple("position")
        expect(retrieved.length).toBe(0)

        const single = store.single("position")
        expect(() => single.get("position")).toThrow()
    })

    it("should handle queries with multiple 'not' components and one positive component", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 }, health: { hp: 100 } })
        store.create({ position: { x: 1, y: 1 }, health: { hp: 50 } })
        store.create({ velocity: { dx: 2, dy: 2 }, health: { hp: 75 } })

        const retrieved = store.multiple("health", "not-position", "not-velocity")
        expect(retrieved.length).toBe(0)
    })

    it("should correctly update queries when components are added and removed in rapid succession", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const query = store.multiple("position", "velocity")

        expect(query.length).toBe(0)

        entity.set("velocity", { dx: 1, dy: 1 })
        expect(query.length).toBe(1)

        entity.delete("velocity")
        expect(query.length).toBe(0)

        entity.set("velocity", { dx: 2, dy: 2 })
        expect(query.length).toBe(1)
    })

    it("should handle queries with all 'not' components", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        store.create({ health: { hp: 100 } })

        const retrieved = store.multiple("not-position", "not-velocity", "not-health")
        expect(retrieved.length).toBe(0)
    })

    it("should maintain consistency when rapidly creating and removing entities", () => {
        const entities = []
        for (let i = 0; i < 1000; i++) {
            entities.push(store.create({ position: { x: i, y: i } }))
        }

        const query = store.multiple("position")
        expect(query.length).toBe(1000)

        for (const entity of entities) {
            store.remove(entity)
        }

        expect(query.length).toBe(0)
    })

    it("should correctly handle queries with duplicate component specifications", () => {
        store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })

        const retrieved = store.multiple("position", "velocity", "position")
        expect(retrieved.length).toBe(1)
    })

    it("should maintain correct entity references when components are added and removed", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const query = store.multiple("position", "velocity")

        entity.set("velocity", { dx: 1, dy: 1 })
        expect(query[0]).toBe(entity)

        entity.delete("velocity")
        expect(query.length).toBe(0)
    })

    it("should correctly update queries when components are modified", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const query = store.multiple("position")

        expect(query.length).toBe(1)

        entity.set("position", { x: 1, y: 1 })
        expect(query.length).toBe(1)
        expect(query[0].get("position")).toEqual({ x: 1, y: 1 })
    })

    it("should handle very large numbers of entities efficiently", () => {
        const start = Date.now()
        for (let i = 0; i < 100000; i++) {
            store.create({ position: { x: i, y: i } })
        }
        const end = Date.now()

        const query = store.multiple("position")
        expect(query.length).toBe(100000)
        expect(end - start).toBeLessThan(1000) // Adjust this threshold as needed
    })

    it("should correctly handle queries with all entities removed and then new ones added", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })

        const query = store.multiple("position")
        expect(query.length).toBe(2)

        store.remove(entity1)
        store.remove(entity2)
        expect(query.length).toBe(0)

        store.create({ position: { x: 2, y: 2 } })
        expect(query.length).toBe(1)
    })

    it("should maintain correct single entity reference when components are modified", () => {
        const entity = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const single = store.single("position", "velocity")

        entity.set("position", { x: 1, y: 1 })
        expect(single.get("position")).toEqual({ x: 1, y: 1 })

        entity.delete("velocity")
        expect(() => single.get("velocity")).toThrow()
    })

    it("should correctly handle removal and immediate re-creation of entities with same components", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const query = store.multiple("position")

        expect(query.length).toBe(1)

        store.remove(entity)
        expect(query.length).toBe(0)

        store.create({ position: { x: 0, y: 0 } })
        expect(query.length).toBe(1)
    })

    it("should handle edge case of creating an entity with no components", () => {
        const entity = store.create({})
        expect(entity).toBeDefined()

        const allQueries = store.multiple()
        expect(allQueries).toContain(entity)
    })

    it("should record non- component entities", () => {
        store.create({ position: { x: 0, y: 0 } })
        const changing = store.changing("not-velocity")
        store.create({ position: { x: 1, y: 1 } })

        expect(changing().added.length).toBe(2)
    })

    it("should record entities changing correctly", () => {
        store.create({ position: { x: 0, y: 0 } })
        const a = store.create({ position: { x: 1, y: 1 }, velocity: { dx: 1, dy: 1 } })

        const changing = store.changing("position")
        const changes = changing()

        const changing2 = store.changing("not-velocity")

        console.log(changes)

        expect(changes.added.length).toBe(2)
        expect(changes.removed.length).toBe(0)
        expect(changes.added[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(changes.added[1].get("position")).toEqual({ x: 1, y: 1 })

        const b = store.create({ position: { x: 2, y: 2 } })
        store.create({ position: { x: 3, y: 3 }, velocity: { dx: 3, dy: 3 } })

        const changes2 = changing2()

        expect(changes2.added.length).toBe(2)
        expect(changes2.removed.length).toBe(0)

        const newChanges = changing()

        expect(newChanges.added.length).toBe(2)
        expect(newChanges.removed.length).toBe(0)
        expect(newChanges.added[0].get("position")).toEqual({ x: 2, y: 2 })
        expect(newChanges.added[1].get("position")).toEqual({ x: 3, y: 3 })

        store.remove(a)
        store.remove(b)

        const removedChanges = changing()

        expect(removedChanges.added.length).toBe(0)
        expect(removedChanges.removed.length).toBe(2)
        expect(removedChanges.removed[0].get("position")).toEqual({ x: 1, y: 1 })
        expect(removedChanges.removed[1].get("position")).toEqual({ x: 2, y: 2 })

        const changes22 = changing2()

        expect(changes22.added.length).toBe(0)
        expect(changes22.removed.length).toBe(1)
    })
})

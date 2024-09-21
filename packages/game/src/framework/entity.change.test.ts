import { beforeEach, describe, expect, it } from "vitest"
import { EntityStore, newEntityStore } from "./entity"

interface TestComponents {
    position: { x: number; y: number }
    velocity: { dx: number; dy: number }
    health: { current: number; max: number }
    tag: string
    render: { model: string; texture: string }
}

let store: EntityStore<TestComponents>

beforeEach(() => {
    store = newEntityStore<TestComponents>()
})

describe("EntityStore changing feature", () => {
    it("should track additions correctly", () => {
        const changeTracker = store.changing("position")

        store.create({ position: { x: 0, y: 0 } })
        store.create({ position: { x: 1, y: 1 } })

        const changes = changeTracker()
        expect(changes.added.length).toBe(2)
        expect(changes.removed.length).toBe(0)
        expect(changes.added[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(changes.added[1].get("position")).toEqual({ x: 1, y: 1 })

        // Subsequent call should return no changes
        const secondChanges = changeTracker()
        expect(secondChanges.added.length).toBe(0)
        expect(secondChanges.removed.length).toBe(0)
    })

    it("should track removals correctly", () => {
        const entity1 = store.create({ position: { x: 0, y: 0 } })
        const entity2 = store.create({ position: { x: 1, y: 1 } })

        const changeTracker = store.changing("position")
        changeTracker() // Clear initial additions

        store.remove(entity1)
        store.remove(entity2)

        const changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(2)
        expect(changes.removed[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(changes.removed[1].get("position")).toEqual({ x: 1, y: 1 })
    })

    it("should handle component removal correctly", () => {
        const entity = store.create({ position: { x: 0, y: 0 }, velocity: { dx: 1, dy: 1 } })
        const changeTracker = store.changing("position", "velocity")
        changeTracker() // Clear initial addition

        entity.delete("velocity")
        const changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(1)
        expect(changes.removed[0].get("position")).toEqual({ x: 0, y: 0 })
    })

    it("should handle component addition correctly", () => {
        const entity = store.create({ position: { x: 0, y: 0 } })
        const changeTracker = store.changing("position", "velocity")
        changeTracker() // Clear initial addition

        entity.set("velocity", { dx: 1, dy: 1 })
        const changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.removed.length).toBe(0)
        expect(changes.added[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(changes.added[0].get("velocity")).toEqual({ dx: 1, dy: 1 })
    })

    it("should track changes with multiple components", () => {
        const changeTracker = store.changing("position", "velocity", "health")

        store.create({ position: { x: 0, y: 0 } })
        store.create({ velocity: { dx: 1, dy: 1 } })
        store.create({
            position: { x: 1, y: 1 },
            velocity: { dx: 2, dy: 2 },
            health: { current: 100, max: 100 },
        })

        const changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.removed.length).toBe(0)
        expect(changes.added[0].get("position")).toEqual({ x: 1, y: 1 })
        expect(changes.added[0].get("velocity")).toEqual({ dx: 2, dy: 2 })
        expect(changes.added[0].get("health")).toEqual({ current: 100, max: 100 })
    })

    it("should track changes with 'not' components", () => {
        const changeTracker = store.changing("position", "not-velocity")

        const entity1 = store.create({ position: { x: 0, y: 0 } })
        store.create({ position: { x: 1, y: 1 }, velocity: { dx: 1, dy: 1 } })

        let changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.added[0].get("position")).toEqual({ x: 0, y: 0 })

        const entity2 = store.create({ position: { x: 2, y: 2 } })
        changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.added[0].get("position")).toEqual({ x: 2, y: 2 })

        entity1.set("velocity", { dx: 0, dy: 0 })
        entity2.set("velocity", { dx: 0, dy: 0 })
        changes = changeTracker()
        expect(changes.removed.length).toBe(2)
        expect(changes.removed[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(changes.removed[1].get("position")).toEqual({ x: 2, y: 2 })
    })

    it("should handle multiple change trackers independently", () => {
        const positionTracker = store.changing("position")
        const velocityTracker = store.changing("velocity")

        store.create({ position: { x: 0, y: 0 } })
        store.create({ velocity: { dx: 1, dy: 1 } })

        const positionChanges = positionTracker()
        const velocityChanges = velocityTracker()

        expect(positionChanges.added.length).toBe(1)
        expect(velocityChanges.added.length).toBe(1)
        expect(positionChanges.added[0].get("position")).toEqual({ x: 0, y: 0 })
        expect(velocityChanges.added[0].get("velocity")).toEqual({ dx: 1, dy: 1 })

        // Subsequent calls should return no changes
        expect(positionTracker().added.length).toBe(0)
        expect(velocityTracker().added.length).toBe(0)
    })

    it("should handle rapid additions and removals", () => {
        const changeTracker = store.changing("position")

        const entity1 = store.create({ position: { x: 0, y: 0 } })
        store.remove(entity1)
        const entity2 = store.create({ position: { x: 1, y: 1 } })
        store.remove(entity2)
        store.create({ position: { x: 2, y: 2 } })

        const changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.removed.length).toBe(0)
        expect(changes.added[0].get("position")).toEqual({ x: 2, y: 2 })
    })

    it("should track changes in primitive component types", () => {
        const changeTracker = store.changing("tag")

        const entity = store.create({ tag: "player" })
        let changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.added[0].get("tag")).toBe("player")

        entity.set("tag", "enemy")
        changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(0)

        entity.delete("tag")
        changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(1)
    })

    it("should handle changes in nested component properties", () => {
        const changeTracker = store.changing("health")

        const entity = store.create({ health: { current: 100, max: 100 } })
        let changes = changeTracker()
        expect(changes.added.length).toBe(1)

        entity.set("health", { current: 80, max: 100 })
        changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(0)

        entity.delete("health")
        changes = changeTracker()
        expect(changes.added.length).toBe(0)
        expect(changes.removed.length).toBe(1)
    })

    it("should handle complex scenarios with multiple trackers", () => {
        const positionVelocityTracker = store.changing("position", "velocity")
        const healthTracker = store.changing("health")
        const renderTracker = store.changing("render")

        const entity1 = store.create({
            position: { x: 0, y: 0 },
            health: { current: 100, max: 100 },
        })
        const entity2 = store.create({ position: { x: 1, y: 1 }, velocity: { dx: 1, dy: 1 } })

        let pvChanges = positionVelocityTracker()
        let hChanges = healthTracker()
        expect(pvChanges.added.length).toBe(1)
        expect(hChanges.added.length).toBe(1)

        entity1.set("velocity", { dx: 0, dy: 0 })
        entity2.set("health", { current: 80, max: 100 })

        pvChanges = positionVelocityTracker()
        hChanges = healthTracker()
        expect(pvChanges.added.length).toBe(1)
        expect(hChanges.added.length).toBe(1)

        entity1.delete("health")
        entity2.delete("velocity")

        pvChanges = positionVelocityTracker()
        hChanges = healthTracker()
        expect(pvChanges.removed.length).toBe(1)
        expect(hChanges.removed.length).toBe(1)

        const entity3 = store.create({ render: { model: "player", texture: "default" } })
        let rChanges = renderTracker()
        expect(rChanges.added.length).toBe(1)

        entity3.set("render", { model: "player_damaged", texture: "damaged" })
        rChanges = renderTracker()
        expect(rChanges.added.length).toBe(0)
        expect(rChanges.removed.length).toBe(0)
    })

    it("should handle entities that temporarily match and then unmatch", () => {
        const tracker = store.changing("position", "velocity")

        const entity = store.create({ position: { x: 0, y: 0 } })
        let changes = tracker()
        expect(changes.added.length).toBe(0)

        entity.set("velocity", { dx: 1, dy: 1 })
        changes = tracker()
        expect(changes.added.length).toBe(1)

        entity.delete("velocity")
        changes = tracker()
        expect(changes.removed.length).toBe(1)

        entity.set("velocity", { dx: 2, dy: 2 })
        changes = tracker()
        expect(changes.added.length).toBe(1)
    })
})

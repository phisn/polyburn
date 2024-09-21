import { beforeEach, describe, expect, it } from "vitest"
import { EntityStore, newEntityStore } from "./entity"

interface AdvancedComponents {
    position: { x: number; y: number; z: number }
    velocity: { dx: number; dy: number; dz: number }
    health: { current: number; max: number }
    inventory: { items: string[] }
    ai: { state: "idle" | "attack" | "flee" }
    render: { model: string; texture: string }
}

let store: EntityStore<AdvancedComponents>

beforeEach(() => {
    store = newEntityStore<AdvancedComponents>()
})

describe("AdvancedEntityStore", () => {
    it("should handle complex entity creation and component interactions", () => {
        const entity = store.create({
            position: { x: 0, y: 0, z: 0 },
            health: { current: 100, max: 100 },
            inventory: { items: ["sword", "shield"] },
        })

        expect(entity.get("position")).toEqual({ x: 0, y: 0, z: 0 })
        expect(entity.get("health")).toEqual({ current: 100, max: 100 })
        expect(entity.get("inventory")).toEqual({ items: ["sword", "shield"] })

        const updatedEntity = entity
            .set("velocity", { dx: 1, dy: 0, dz: 0 })
            .set("ai", { state: "idle" })

        expect(updatedEntity.get("velocity")).toEqual({ dx: 1, dy: 0, dz: 0 })
        expect(updatedEntity.get("ai")).toEqual({ state: "idle" })

        const finalEntity = updatedEntity.set("health", { current: 80, max: 100 })
        expect(finalEntity.get("health")).toEqual({ current: 80, max: 100 })
    })

    it("should handle complex queries with multiple components and negations", () => {
        store.create({
            position: { x: 0, y: 0, z: 0 },
            velocity: { dx: 1, dy: 0, dz: 0 },
            health: { current: 100, max: 100 },
            ai: { state: "idle" },
        })
        store.create({
            position: { x: 10, y: 10, z: 10 },
            health: { current: 50, max: 100 },
            inventory: { items: ["potion"] },
        })
        store.create({
            position: { x: 20, y: 20, z: 20 },
            velocity: { dx: 0, dy: 1, dz: 0 },
            render: { model: "player", texture: "default" },
        })

        const result = store.multiple("position", "health", "not-velocity", "not-ai")
        expect(result.length).toBe(1)
        expect(result[0].get("position")).toEqual({ x: 10, y: 10, z: 10 })
        expect(result[0].get("health")).toEqual({ current: 50, max: 100 })
    })

    it("should correctly track changes in complex scenarios", () => {
        const changeTracker = store.changing("position", "health", "not-ai")

        const entity1 = store.create({
            position: { x: 0, y: 0, z: 0 },
            health: { current: 100, max: 100 },
        })
        const entity2 = store.create({
            position: { x: 10, y: 10, z: 10 },
            health: { current: 80, max: 100 },
            ai: { state: "idle" },
        })

        let changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.added[0].get("position")).toEqual({ x: 0, y: 0, z: 0 })

        entity2.delete("ai")
        changes = changeTracker()
        expect(changes.added.length).toBe(1)
        expect(changes.added[0].get("position")).toEqual({ x: 10, y: 10, z: 10 })

        entity1.set("ai", { state: "attack" })
        changes = changeTracker()
        expect(changes.removed.length).toBe(1)
        expect(changes.removed[0].get("position")).toEqual({ x: 0, y: 0, z: 0 })
    })

    it("should handle rapid component additions and removals", () => {
        const entity = store.create({ position: { x: 0, y: 0, z: 0 } })
        const query = store.multiple("position", "velocity", "health")

        expect(query.length).toBe(0)

        entity.set("velocity", { dx: 1, dy: 0, dz: 0 })
        entity.set("health", { current: 100, max: 100 })
        expect(query.length).toBe(1)

        entity.delete("velocity")
        expect(query.length).toBe(0)

        entity.set("velocity", { dx: 2, dy: 0, dz: 0 })
        expect(query.length).toBe(1)

        entity.delete("health")
        entity.delete("velocity")
        expect(query.length).toBe(0)
    })

    it("should maintain consistency with single queries in edge cases", () => {
        store.create({
            position: { x: 0, y: 0, z: 0 },
            health: { current: 100, max: 100 },
        })

        const singleQuery = store.single("position", "health", "not-velocity")
        expect(singleQuery().get("position")).toEqual({ x: 0, y: 0, z: 0 })

        const b = store.create({
            position: { x: 10, y: 10, z: 10 },
            health: { current: 80, max: 100 },
        })

        expect(() => singleQuery().get("position")).toThrow()

        store.create({
            position: { x: 20, y: 20, z: 20 },
            health: { current: 90, max: 100 },
            velocity: { dx: 1, dy: 1, dz: 1 },
        })

        store.remove(b)

        expect(singleQuery().get("position")).toEqual({ x: 0, y: 0, z: 0 })
    })

    it("should handle complex inventory management", () => {
        const entity = store.create({
            inventory: { items: ["sword", "shield"] },
        })

        const inventoryQuery = store.multiple("inventory")
        expect(inventoryQuery.length).toBe(1)
        expect(inventoryQuery[0].get("inventory").items).toEqual(["sword", "shield"])

        entity.set("inventory", { items: [...entity.get("inventory").items, "potion"] })
        expect(inventoryQuery[0].get("inventory").items).toEqual(["sword", "shield", "potion"])

        entity.set("inventory", {
            items: entity.get("inventory").items.filter(item => item !== "shield"),
        })
        expect(inventoryQuery[0].get("inventory").items).toEqual(["sword", "potion"])

        entity.delete("inventory")
        expect(inventoryQuery.length).toBe(0)
    })

    it("should correctly handle AI state transitions", () => {
        const entity = store.create({
            ai: { state: "idle" },
            health: { current: 100, max: 100 },
        })

        const aiQuery = store.multiple("ai", "health")
        expect(aiQuery.length).toBe(1)
        expect(aiQuery[0].get("ai").state).toBe("idle")

        entity.set("ai", { state: "attack" })
        expect(aiQuery[0].get("ai").state).toBe("attack")

        entity.set("health", { current: 20, max: 100 })
        entity.set("ai", { state: "flee" })
        expect(aiQuery[0].get("ai").state).toBe("flee")
        expect(aiQuery[0].get("health").current).toBe(20)

        entity.delete("ai")
        expect(aiQuery.length).toBe(0)
    })

    it("should handle complex render component updates", () => {
        const entity = store.create({
            render: { model: "player", texture: "default" },
        })

        const renderQuery = store.multiple("render")
        expect(renderQuery.length).toBe(1)
        expect(renderQuery[0].get("render")).toEqual({ model: "player", texture: "default" })

        entity.set("render", { ...entity.get("render"), texture: "damaged" })
        expect(renderQuery[0].get("render")).toEqual({ model: "player", texture: "damaged" })

        entity.set("render", { model: "player_low_health", texture: "damaged" })
        expect(renderQuery[0].get("render")).toEqual({
            model: "player_low_health",
            texture: "damaged",
        })

        entity.delete("render")
        expect(renderQuery.length).toBe(0)
    })

    it("should handle complex component interactions and dependencies", () => {
        const entity = store.create({
            position: { x: 0, y: 0, z: 0 },
            velocity: { dx: 1, dy: 0, dz: 0 },
            health: { current: 100, max: 100 },
            ai: { state: "idle" },
        })

        const complexQuery = store.multiple("position", "velocity", "health", "ai")
        expect(complexQuery.length).toBe(1)

        entity.set("health", { current: 50, max: 100 })
        entity.set("ai", { state: "flee" })

        expect(complexQuery[0].get("health").current).toBe(50)
        expect(complexQuery[0].get("ai").state).toBe("flee")

        entity.delete("velocity")
        expect(complexQuery.length).toBe(0)

        const newQuery = store.multiple("position", "health", "ai", "not-velocity")
        expect(newQuery.length).toBe(1)
    })
})

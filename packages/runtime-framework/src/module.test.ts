import { beforeEach, describe, expect, it, vitest } from "vitest"
import { ModuleLookup, ModuleStore } from "./module"

interface Behaviors {
    name(): string
    increase(): void
    decrease(): void
    getNumber(): number
}

let store: ModuleStore<Behaviors>
let lookup: ModuleLookup<Behaviors>

beforeEach(() => {
    store = new ModuleStore<Behaviors>()
    lookup = new ModuleLookup(store)
})

describe("ModuleStore and ModuleLookup", () => {
    it("should register and remove modules correctly", () => {
        const disposeFn = vitest.fn()
        const module = store.register({ name: () => "Module1" }, disposeFn)
        expect(lookup.multiple("name")).toContain(module)

        expect(disposeFn).not.toHaveBeenCalled()

        store.remove(module.id)
        expect(lookup.multiple("name")).not.toContain(module)
        expect(disposeFn).toHaveBeenCalledOnce()
    })

    it("should register and remove modules correctly without dispose", () => {
        const module = store.register({ name: () => "Module1" })
        expect(lookup.multiple("name")).toContain(module)

        store.remove(module.id)
        expect(lookup.multiple("name")).not.toContain(module)
    })

    it("should throw if removed module is removed again", () => {
        const module = store.register({ name: () => "Module1" })
        store.remove(module.id)
        expect(() => store.remove(module.id)).toThrow()
    })

    it("should throw if module is not found", () => {
        expect(() => store.remove(1)).toThrow()
    })

    it("should call listeners for listen", () => {
        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        const module = store.register({ name: () => "Module1" })

        store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        expect(notifyAdded).toHaveBeenCalledWith(module)
        expect(notifyAdded).toHaveBeenCalledOnce()
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        const module2 = store.register({ name: () => "Module2" })

        expect(notifyAdded).toHaveBeenCalledWith(module2)
        expect(notifyAdded).toHaveBeenCalledOnce()
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        store.remove(module.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).toHaveBeenCalledWith(module)
        expect(notifyRemoved).toHaveBeenCalledOnce()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        store.remove(module2.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).toHaveBeenCalledWith(module2)
        expect(notifyRemoved).toHaveBeenCalledOnce()
    })

    it("should not call listeners after unregister", () => {
        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        const module = store.register({ name: () => "Module1" })

        const unlisten = store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        expect(notifyAdded).toHaveBeenCalledWith(module)
        expect(notifyAdded).toHaveBeenCalledOnce()
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        unlisten()

        store.register({ name: () => "Module2" })
        store.remove(module.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).not.toHaveBeenCalled()
    })

    it("should not include removed modules in listeners", () => {
        const module = store.register({ name: () => "Module1" })
        store.remove(module.id)

        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).not.toHaveBeenCalled()
    })

    it("new listeners should include new as well as old modules", () => {
        const module = store.register({ name: () => "Module1" })

        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        store.listen(["name"], {
            notifyAdded: () => {},
            notifyRemoved: () => {},
        })

        store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        expect(notifyAdded).toHaveBeenCalledOnce()
        expect(notifyAdded).toHaveBeenCalledWith(module)
        expect(notifyRemoved).not.toHaveBeenCalled()
    })

    it("should handle a variety of archetypes created before listener", () => {
        const a = store.register({ name: () => "Module1" })
        const b = store.register({
            increase: () => {},
            decrease: () => {},
            getNumber: () => 0,
        })
        const c = store.register({ increase: () => {}, decrease: () => {} })
        store.register({ name: () => "Module4", getNumber: () => 0 })
        store.register({ getNumber: () => 0 })
        store.register({ getNumber: () => 0 })
        store.register({ getNumber: () => 0 })

        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        expect(notifyAdded).toHaveBeenCalledTimes(2)
        expect(notifyRemoved).not.toHaveBeenCalled()

        const notifyAdded2 = vitest.fn()
        const notifyRemoved2 = vitest.fn()

        store.listen(["increase", "decrease"], {
            notifyAdded: notifyAdded2,
            notifyRemoved: notifyRemoved2,
        })

        expect(notifyAdded2).toHaveBeenCalledTimes(2)
        expect(notifyRemoved2).not.toHaveBeenCalled()

        const notifyAdded3 = vitest.fn()
        const notifyRemoved3 = vitest.fn()

        store.listen(["increase", "decrease"], {
            notifyAdded: notifyAdded3,
            notifyRemoved: notifyRemoved3,
        })

        expect(notifyAdded3).toHaveBeenCalledTimes(2)
        expect(notifyRemoved3).not.toHaveBeenCalled()

        const notifyAdded4 = vitest.fn()
        const notifyRemoved4 = vitest.fn()

        store.listen(["getNumber"], {
            notifyAdded: notifyAdded4,
            notifyRemoved: notifyRemoved4,
        })

        expect(notifyAdded4).toHaveBeenCalledTimes(5)
        expect(notifyRemoved4).not.toHaveBeenCalled()

        const notifyAdded5 = vitest.fn()
        const notifyRemoved5 = vitest.fn()

        store.listen(["name", "increase", "decrease", "getNumber"], {
            notifyAdded: notifyAdded5,
            notifyRemoved: notifyRemoved5,
        })

        expect(notifyAdded5).not.toHaveBeenCalled()
        expect(notifyRemoved5).not.toHaveBeenCalled()

        const notifyAdded6 = vitest.fn()
        const notifyRemoved6 = vitest.fn()

        store.listen([], {
            notifyAdded: notifyAdded6,
            notifyRemoved: notifyRemoved6,
        })

        expect(notifyAdded6).toHaveBeenCalledTimes(7)
        expect(notifyRemoved6).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()
        notifyAdded2.mockClear()
        notifyRemoved2.mockClear()
        notifyAdded3.mockClear()
        notifyRemoved3.mockClear()
        notifyAdded4.mockClear()
        notifyRemoved4.mockClear()
        notifyAdded5.mockClear()
        notifyRemoved5.mockClear()
        notifyAdded6.mockClear()
        notifyRemoved6.mockClear()

        store.remove(a.id)
        store.remove(b.id)
        store.remove(c.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).toHaveBeenCalledTimes(1)

        expect(notifyAdded2).not.toHaveBeenCalled()
        expect(notifyRemoved2).toHaveBeenCalledTimes(2)

        expect(notifyAdded3).not.toHaveBeenCalled()
        expect(notifyRemoved3).toHaveBeenCalledTimes(2)

        expect(notifyAdded4).not.toHaveBeenCalled()
        expect(notifyRemoved4).toHaveBeenCalledTimes(1)

        expect(notifyAdded5).not.toHaveBeenCalled()
        expect(notifyRemoved5).not.toHaveBeenCalled()

        expect(notifyAdded6).not.toHaveBeenCalled()
        expect(notifyRemoved6).toHaveBeenCalledTimes(3)
    })

    it("should handle a variety of archetypes created after listener", () => {
        const notifyAdded = vitest.fn()
        const notifyRemoved = vitest.fn()

        store.listen(["name"], {
            notifyAdded: notifyAdded,
            notifyRemoved: notifyRemoved,
        })

        const notifyAdded2 = vitest.fn()
        const notifyRemoved2 = vitest.fn()

        store.listen(["increase", "decrease"], {
            notifyAdded: notifyAdded2,
            notifyRemoved: notifyRemoved2,
        })

        const notifyAdded3 = vitest.fn()
        const notifyRemoved3 = vitest.fn()

        store.listen(["increase", "decrease"], {
            notifyAdded: notifyAdded3,
            notifyRemoved: notifyRemoved3,
        })

        const notifyAdded4 = vitest.fn()
        const notifyRemoved4 = vitest.fn()

        store.listen(["getNumber"], {
            notifyAdded: notifyAdded4,
            notifyRemoved: notifyRemoved4,
        })

        const notifyAdded5 = vitest.fn()
        const notifyRemoved5 = vitest.fn()

        store.listen(["name", "increase", "decrease", "getNumber"], {
            notifyAdded: notifyAdded5,
            notifyRemoved: notifyRemoved5,
        })

        const notifyAdded6 = vitest.fn()
        const notifyRemoved6 = vitest.fn()

        store.listen([], {
            notifyAdded: notifyAdded6,
            notifyRemoved: notifyRemoved6,
        })

        const a = store.register({ name: () => "Module1" })
        const b = store.register({
            increase: () => {},
            decrease: () => {},
            getNumber: () => 0,
        })
        const c = store.register({ increase: () => {}, decrease: () => {} })
        store.register({ name: () => "Module4", getNumber: () => 0 })
        store.register({ getNumber: () => 0 })
        store.register({ getNumber: () => 0 })
        store.register({ getNumber: () => 0 })

        expect(notifyAdded).toHaveBeenCalledTimes(2)
        expect(notifyRemoved).not.toHaveBeenCalled()

        expect(notifyAdded2).toHaveBeenCalledTimes(2)
        expect(notifyRemoved2).not.toHaveBeenCalled()

        expect(notifyAdded3).toHaveBeenCalledTimes(2)
        expect(notifyRemoved3).not.toHaveBeenCalled()

        expect(notifyAdded4).toHaveBeenCalledTimes(5)
        expect(notifyRemoved4).not.toHaveBeenCalled()

        expect(notifyAdded5).not.toHaveBeenCalled()
        expect(notifyRemoved5).not.toHaveBeenCalled()

        expect(notifyAdded6).toHaveBeenCalledTimes(7)
        expect(notifyRemoved6).not.toHaveBeenCalled()
    })

    it("should handle multiple correctly", () => {
        const a = store.register({ name: () => "Module1" })
        const b = store.register({ name: () => "Module2", increase: () => {} })
        const c = store.register({ increase: () => {} })

        const m = lookup.multiple("name")

        expect(m).toBe(lookup.multiple("name"))

        expect(m).toContain(a)
        expect(m).toContain(b)
        expect(m).not.toContain(c)

        const m2 = lookup.multiple("increase")

        expect(m2).not.toBe(m)
        expect(m2).toContain(b)
        expect(m2).toContain(c)

        const m3 = lookup.multiple("getNumber")

        expect(m3.length).toBe(0)

        const d = store.register({ getNumber: () => 0 })
        store.remove(a.id)
        store.remove(b.id)
        store.remove(c.id)

        expect(m.length).toBe(0)
        expect(m2.length).toBe(0)
        expect(m3).toContain(d)
    })

    it("should handle single correctly", () => {
        const a = store.register({ name: () => "Module1" })
        const b = store.register({ name: () => "Module2", increase: () => {} })
        store.register({ increase: () => {} })

        const s = lookup.single("name")

        expect(() => s()).toThrow()

        store.remove(a.id)

        expect(s()).toBe(b)

        store.remove(b.id)

        expect(() => s()).toThrow()

        expect(s).toBe(lookup.single("name"))

        const c = store.register({ name: () => "Module3" })

        expect(s()).toBe(c)
    })

    it("should handle changing correctly", () => {
        const a = store.register({ name: () => "Module1" })
        const b = store.register({ name: () => "Module2", increase: () => {} })
        const c = store.register({ increase: () => {} })

        const ch = lookup.changing("name")

        expect(ch()).toMatchObject({ added: [a, b], removed: [] })
        expect(ch()).toMatchObject({ added: [], removed: [] })

        const d = store.register({ name: () => "Module3" })

        expect(ch()).toMatchObject({ added: [d], removed: [] })

        store.remove(a.id)

        expect(ch()).toMatchObject({ added: [], removed: [a] })

        store.remove(b.id)

        expect(ch()).toMatchObject({ added: [], removed: [b] })
        expect(ch()).toMatchObject({ added: [], removed: [] })

        const e = store.register({ name: () => "Module4" })
        store.remove(e.id)
        store.remove(c.id)

        expect(ch()).toMatchObject({ added: [], removed: [] })
    })
})

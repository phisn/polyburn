import { beforeEach, describe, expect, it, vitest } from "vitest"
import { BaseModuleStore, ModuleLookup } from "./module"

interface Behaviors {
    name(): string
    increase(): void
    decrease(): void
    getNumber(): number
}

let store: BaseModuleStore<Behaviors>
let lookup: ModuleLookup<Behaviors>

beforeEach(() => {
    store = new BaseModuleStore<Behaviors>()
    lookup = new ModuleLookup(store)
})

describe("ModuleStore and ModuleLookup", () => {
    it("should register and remove modules correctly", () => {
        const disposeFn = vitest.fn()
        const module = store.register({ name: () => "Module1" }, disposeFn)
        expect(lookup.multiple("name")).toContain(module)

        store.remove(module.id)
        expect(lookup.multiple("name")).not.toContain(module)
        expect(disposeFn).toHaveBeenCalled()
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
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        const module2 = store.register({ name: () => "Module2" })

        expect(notifyAdded).toHaveBeenCalledWith(module2)
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        store.remove(module.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).toHaveBeenCalledWith(module)

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        store.remove(module2.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).toHaveBeenCalledWith(module2)
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
        expect(notifyRemoved).not.toHaveBeenCalled()

        notifyAdded.mockClear()
        notifyRemoved.mockClear()

        unlisten()

        store.register({ name: () => "Module2" })
        store.remove(module.id)

        expect(notifyAdded).not.toHaveBeenCalled()
        expect(notifyRemoved).not.toHaveBeenCalled()
    })

    it("should call listeners consistently", () => {
        let state = ""
        let expected = ""

        let listeners = []
        let modules = []

        for (let i = 0; i < 5; ++i) {
            const module = store.register({
                name: () => "Module" + i,
                increase: () => {},
            })

            modules.push(module)
        }

        for (let i = 0; i < 100; ++i) {
            const unlisten = store.listen(["name"], {
                notifyAdded: module => {
                    state += "A" + module.name()
                },
                notifyRemoved: module => {
                    state += "R" + module.name()
                },
            })

            for (const module of modules) {
                state += "A" + module.name()
            }

            listeners.push(unlisten)

            if (listeners.length > 5) {
                const unlisten = listeners.shift()
                unlisten?.()
            }
        }
    })
})

type BehaviorType = object

export type Module<
    Type extends BehaviorType = object,
    Behaviors extends BehaviorType = object,
> = Readonly<Type & Partial<Behaviors>> & {
    get id(): number
}

interface Listener<Behaviors extends BehaviorType, K extends keyof Behaviors> {
    notifyAdded(module: Module<Pick<Behaviors, K>, Behaviors>): void
    notifyRemoved(module: Module<Pick<Behaviors, K>, Behaviors>): void
}

export interface BaseModuleStore<Behaviors extends BehaviorType> {
    get<K extends (keyof Behaviors)[]>(
        id: number,
        ...assume: K
    ): Module<Pick<Behaviors, K[number]>, Behaviors>

    register<K extends keyof Behaviors>(
        behaviors: Pick<Behaviors, K>,
        onDispose?: () => void,
    ): Module<Pick<Behaviors, K>, Behaviors>

    attach<K extends keyof Behaviors>(
        to: number,
        behaviors: Pick<Behaviors, K>,
        onDispose?: () => void,
    ): Module<Pick<Behaviors, K>>

    remove(id: number): void

    listen<T extends (keyof Behaviors)[]>(
        behaviors: [...T],
        listener: Listener<Behaviors, T[number]>,
    ): () => void
}

export interface ModuleLookup<Behaviors extends BehaviorType> {
    multiple<K extends (keyof Behaviors)[]>(
        ...behaviors: K
    ): readonly Module<Pick<Behaviors, K[number]>, Behaviors>[]

    single<K extends (keyof Behaviors)[]>(
        ...behavior: K
    ): () => Module<Pick<Behaviors, K[number]>, Behaviors>

    changing<K extends (keyof Behaviors)[]>(
        ...behavior: K
    ): () => {
        added: readonly Module<Pick<Behaviors, K[number]>, Behaviors>[]
        removed: readonly Module<Pick<Behaviors, K[number]>, Behaviors>[]
    }
}

export type ModuleStore<Behaviors extends Record<string, object>> = BaseModuleStore<Behaviors> &
    ModuleLookup<Behaviors>

class ListenerTracker<Behaviors extends BehaviorType> {
    private listeners: Listener<Behaviors, keyof Behaviors>[] = []
    private listenerToIndex = new Map<Listener<Behaviors, keyof Behaviors>, number>()

    constructor(private _requirements: (keyof Behaviors)[]) {}

    get requirements(): readonly (keyof Behaviors)[] {
        return this._requirements
    }

    add(listener: Listener<Behaviors, keyof Behaviors>): void {
        this.listenerToIndex.set(listener, this.listeners.length)
        this.listeners.push(listener)
    }

    remove(listener: Listener<Behaviors, keyof Behaviors>): void {
        const index = this.listenerToIndex.get(listener)

        if (index === undefined) {
            throw new Error("Listener not found")
        }

        this.listeners[index] = this.listeners[this.listeners.length - 1]
        this.listeners.pop()

        this.listenerToIndex.delete(listener)
        this.listenerToIndex.set(this.listeners[index], index)
    }

    notifyAdded(module: Module<Pick<Behaviors, any>>): void {
        for (const listener of this.listeners) {
            listener.notifyAdded(module)
        }
    }

    notifyRemoved(module: Module<Pick<Behaviors, any>>): void {
        for (const listener of this.listeners) {
            listener.notifyRemoved(module)
        }
    }
}

interface ModuleArcheType<Behaviors extends BehaviorType> {
    modules: Map<number, Module<Pick<Behaviors, any>>>
    behaviors: (keyof Behaviors)[]
    listenerTrackers: ListenerTracker<Behaviors>[]
}

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
export class BaseModuleStore<Behaviors extends BehaviorType> implements BaseModuleStore<Behaviors> {
    private nextId = 0

    private moduleToArchetype = new Map<number, ModuleArcheType<Behaviors>>()
    private archeTypes = new Map<string, ModuleArcheType<Behaviors>>()
    private modulesToOnDispose = new Map<number, () => void>()

    get<K extends (keyof Behaviors)[]>(
        id: number,
        ...assume: K
    ): Module<Pick<Behaviors, K[number]>> {
        const archeType = this.moduleToArchetype.get(id)

        if (archeType === undefined) {
            throw new Error(`Module with id ${id} not found`)
        }

        for (const behavior of assume) {
            if (!archeType.behaviors.includes(behavior)) {
                throw new Error(
                    `Module with id ${id} does not have behavior ${behavior.toString()}`,
                )
            }
        }

        const module = archeType?.modules.get(id)

        if (archeType === undefined || module === undefined) {
            throw new Error(`Module with id ${id} not found`)
        }

        return module as Module<Pick<Behaviors, K[number]>>
    }

    register<T extends keyof Behaviors>(
        behaviors: Pick<Behaviors, T>,
        onDispose?: () => void,
    ): Module<Pick<Behaviors, T>> {
        const id = this.nextId++

        const module: Module<Pick<Behaviors, T>> = {
            ...behaviors,
            id,
        }

        const archeType = this.emplaceArchetype(Object.keys(behaviors) as (keyof Behaviors)[])

        if (onDispose) {
            this.modulesToOnDispose.set(id, onDispose)
        }

        archeType.modules.set(id, module)
        this.moduleToArchetype.set(id, archeType)

        for (const listenerTracker of archeType.listenerTrackers) {
            listenerTracker.notifyAdded(module)
        }

        return module
    }

    attach<K extends keyof Behaviors>(
        to: number,
        behaviors: Pick<Behaviors, K>,
        onDispose?: (() => void) | undefined,
    ): Module<Pick<Behaviors, K>> {
        const y

        archeType = this.moduleToArchetype.get(to)

        if (archeType === undefined) {
            throw new Error(`Module with id ${to} not found`)
        }

        const module = archeType.modules.get(to)

        if (module === undefined) {
            throw new Error(`Module with id ${to} not found`)
        }
    }

    remove(id: number): void {
        const archeType = this.moduleToArchetype.get(id)
        const module = archeType?.modules.get(id)

        if (archeType === undefined || module === undefined) {
            throw new Error(`Module with id ${id} not found`)
        }

        this.modulesToOnDispose.get(id)?.()
        this.modulesToOnDispose.delete(id)

        for (const listenerTracker of archeType.listenerTrackers) {
            listenerTracker.notifyRemoved(module)
        }

        archeType.modules.delete(id)
    }

    private keyToListeners = new Map<string, ListenerTracker<Behaviors>>()
    private requirementsToArcheType = new Map<string, ModuleArcheType<Behaviors>[]>()
    private requirements: [(keyof Behaviors)[], string][] = []

    listen<T extends (keyof Behaviors)[]>(
        requirements: [...T],
        listener: Listener<Behaviors, T[number]>,
    ): () => void {
        const key = keyFromModule<Behaviors>(requirements)

        let archeTypes = this.requirementsToArcheType.get(key)

        if (archeTypes === undefined) {
            archeTypes = []

            for (const [key, archeType] of this.archeTypes) {
                if (this.satisfiesRequirements(archeType.behaviors, requirements)) {
                    archeTypes.push(archeType)
                }
            }

            this.requirementsToArcheType.set(key, archeTypes)
            this.requirements.push([requirements, key])
        }

        let listeners = this.keyToListeners.get(key)

        if (listeners === undefined) {
            listeners = new ListenerTracker(requirements)
            this.keyToListeners.set(key, listeners)

            for (const archeType of archeTypes) {
                archeType.listenerTrackers.push(listeners)
            }
        }

        for (const archeType of archeTypes) {
            for (const module of archeType.modules.values()) {
                listener.notifyAdded(module)
            }
        }

        listeners.add(listener)
        return () => void listeners!.remove(listener)
    }

    private emplaceArchetype(behaviors: (keyof Behaviors)[]) {
        const key = keyFromModule(behaviors)
        let archeType = this.archeTypes.get(key)

        if (archeType === undefined) {
            archeType = {
                modules: new Map(),
                behaviors,
                listenerTrackers: [],
            }

            console.log(`Emplacing archetype with behaviors ${key}`)
            this.archeTypes.set(key, archeType)

            for (const [requirement, key] of this.requirements) {
                if (this.satisfiesRequirements(behaviors, requirement)) {
                    this.requirementsToArcheType.get(key)!.push(archeType)

                    const listeners = this.keyToListeners.get(key)

                    if (listeners !== undefined) {
                        archeType.listenerTrackers.push(listeners)
                    }
                }
            }
        }

        return archeType
    }

    private satisfiesRequirements(
        behaviors: readonly (keyof Behaviors)[],
        requirements: readonly (keyof Behaviors)[],
    ) {
        return requirements.every(x => behaviors.includes(x))
    }
}

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
export class ModuleLookup<Behaviors extends BehaviorType> implements ModuleLookup<Behaviors> {
    constructor(private store: BaseModuleStore<Behaviors>) {}

    private cacheMultiple = new Map<string, readonly Module<Pick<Behaviors, any>>[]>()
    private cacheSingle = new Map<string, () => Module<Pick<Behaviors, any>>>()

    multiple<K extends (keyof Behaviors)[]>(
        ...behaviors: K
    ): readonly Module<Pick<Behaviors, K[number]>>[] {
        const key = keyFromModule<Behaviors>(behaviors)
        const cached = this.cacheMultiple.get(key)

        if (cached !== undefined) {
            return cached
        }

        const multiple = new Multiple(behaviors as string[])

        this.store.listen(behaviors, {
            notifyAdded: module => {
                console.log(`Added module ${module.id} with behaviors ${key}`)
                multiple.push(module)
            },
            notifyRemoved: module => {
                console.log(`Removed module ${module.id} with behaviors ${key}`)
                multiple.remove(module)
            },
        })

        this.cacheMultiple.set(key, multiple.modules)
        return multiple.modules
    }

    single<K extends (keyof Behaviors)[]>(
        ...behaviors: K
    ): () => Module<Pick<Behaviors, K[number]>> {
        const key = keyFromModule<Behaviors>(behaviors)
        const cached = this.cacheSingle.get(key)

        if (cached !== undefined) {
            return cached
        }

        const multiple = this.multiple<K>(...behaviors)

        const result = () => {
            console.log(multiple)

            if (multiple.length === 0) {
                throw new Error(`No modules found with behaviors ${key}`)
            }

            if (multiple.length > 1) {
                throw new Error(`Multiple modules found with behaviors ${key}`)
            }

            return multiple[0]
        }

        this.cacheSingle.set(key, result)

        return result
    }

    changing<K extends (keyof Behaviors)[]>(...behaviors: K) {
        const changeListener = new ChangeListener(behaviors as string[])

        const result = () => changeListener.pop()
        const resultRef = new WeakRef(result)

        const unlisten = this.store.listen(behaviors, {
            notifyAdded: entity => {
                if (resultRef.deref() === undefined) {
                    unlisten()
                    return
                }

                changeListener.notifyAdded(entity)
            },
            notifyRemoved: entity => {
                if (resultRef.deref() === undefined) {
                    unlisten()
                    return
                }

                changeListener.notifyRemoved(entity)
            },
        })

        return () => changeListener.pop()
    }
}

class Multiple {
    private _modules: Module<any>[]
    private _moduleToIndex: Map<number, number>
    private _requirements: string[]

    constructor(requirements: string[]) {
        this._requirements = requirements
        this._modules = []
        this._moduleToIndex = new Map()
    }

    get modules(): readonly Module<any>[] {
        return this._modules
    }

    get requirements(): readonly string[] {
        return this._requirements
    }

    push(modules: Module<any>) {
        this._modules.push(modules)
        this._moduleToIndex.set(modules.id, this._modules.length - 1)
    }

    remove(modules: Module<any>) {
        const index = this._moduleToIndex.get(modules.id)

        if (index === undefined) {
            throw new Error("Entity not found in list")
        }

        const last = this._modules.pop()!

        if (index !== this._modules.length) {
            this._modules[index] = last
            this._moduleToIndex.set(last.id, index)
        }

        this._moduleToIndex.delete(modules.id)
    }

    has(modules: Module<any>) {
        return this._moduleToIndex.has(modules.id)
    }

    popAll() {
        const temp = this._modules
        this._modules = []
        this._moduleToIndex.clear()
        return temp
    }
}

class ChangeListener {
    private _added: Multiple
    private _removed: Multiple

    private empty = { added: [], removed: [] }

    constructor(requirements: string[]) {
        this._added = new Multiple(requirements)
        this._removed = new Multiple(requirements)
    }

    get added() {
        return this._added.modules
    }

    get removed() {
        return this._removed.modules
    }

    get requirements() {
        return this._added.requirements
    }

    notifyAdded(entity: Module<any>) {
        if (this._removed.has(entity)) {
            this._removed.remove(entity)
        } else {
            this._added.push(entity)
        }
    }

    notifyRemoved(entity: Module<any>) {
        if (this._added.has(entity)) {
            this._added.remove(entity)
        } else {
            this._removed.push(entity)
        }
    }

    pop() {
        if (this._added.modules.length === 0 && this._removed.modules.length === 0) {
            return this.empty
        }

        return {
            added: this._added.popAll(),
            removed: this._removed.popAll(),
        }
    }
}

function keyFromModule<Behaviors extends object>(behaviors: readonly (keyof Behaviors)[]): string {
    const behaviorsStr = behaviors.map(x => x.toString())
    behaviorsStr.sort()
    return behaviorsStr.join(",")
}

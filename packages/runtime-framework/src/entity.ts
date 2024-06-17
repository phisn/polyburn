export type EntityWith<Components extends object, C extends keyof Components> = Pick<
    Components,
    C
> &
    Partial<Components>

const ModifierNot = "not-"

// => keyof Components & "not-" + keyof Components
type ComponentsWithModifier<Components extends object> =
    | keyof Components
    | `${typeof ModifierNot}${keyof Components & string}`

// filter the result of ComponentsWithModifier so that it is keyof Components
type FilterModifier<
    C extends string | number | symbol,
    Components extends object,
> = C extends keyof Components ? C : never

export interface EntityChange<Components extends object, C extends keyof Components> {
    added: Iterable<EntityWith<Components, C>>
    removed: Iterable<EntityWith<Components, C>>
}

export interface EntityStore<Components extends object> {
    create<K extends keyof Components>(components: Pick<Components, K>): EntityWith<Components, K>
    remove<K extends keyof Components>(entity: EntityWith<Components, K>): void

    single<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): EntityWith<Components, FilterModifier<C[number], Components>>

    multiple<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): Iterable<EntityWith<Components, FilterModifier<C[number], Components>>>

    changing<K extends ComponentsWithModifier<Components>[]>(
        ...components: K
    ): () => EntityChange<Components, FilterModifier<K[number], Components>>
}

const s: ReadonlySet<number> = new Set<number>()
const k: Iterable<number> = s

for (const x of k) {
    console.log(x)
}

class WeakList<T extends WeakKey> {
    private list: WeakRef<T>[] = []
    private inUse = false

    push(value: T) {
        this.list.push(new WeakRef(value))
    }

    *values() {
        if (this.inUse) {
            throw new Error("WeakList is being used concurrently")
        }

        this.inUse = true
        let dirty = false

        for (const item of this.list) {
            const value = item.deref()

            if (value === undefined) {
                dirty = true
                continue
            }

            yield value
        }

        if (dirty) {
            this.list = this.list.filter(x => x.deref() !== undefined)
        }

        this.inUse = false
    }
}

export function newEntityStore<Components extends object>(): EntityStore<Components> {
    const forbiddenKeys = ["__id", "__key", "__archeType", "__internal", "__entity", ModifierNot]

    function componentsToKey(components: string[]) {
        return components.sort().join(",")
    }

    function requirementsSatisfyComponents(requirements: string[], components: string[]) {
        for (const requirement of requirements) {
            if (requirement.startsWith(ModifierNot)) {
                const forbidden = requirement.slice(ModifierNot.length)

                if (components.includes(forbidden)) {
                    return false
                }

                continue
            }

            if (components.includes(requirement) === false) {
                return false
            }
        }

        return true
    }

    function populateArcheTypeList(archeType: EntityArcheType, list: EntityList) {
        archeType.lists.push(list)

        for (const requirement of list.requirements) {
            let componentToList = archeType.componentToLists.get(requirement)

            if (componentToList === undefined) {
                componentToList = []
                archeType.componentToLists.set(requirement, componentToList)
            }

            componentToList.push(list)
        }
    }

    function populateArcheTypeChangeListener(
        archeType: EntityArcheType,
        changeListener: ChangeListener,
    ) {
        archeType.changeListeners.push(changeListener)

        for (const requirement of changeListener.requirements) {
            let componentToChangeListener = archeType.componentToChangeListeners.get(requirement)

            if (componentToChangeListener === undefined) {
                componentToChangeListener = new WeakList()
                archeType.componentToChangeListeners.set(requirement, componentToChangeListener)
            }

            componentToChangeListener.push(changeListener)
        }
    }

    function emplaceEntityArcheType(key: string, components: string[]) {
        let archeType = entityArcheTypes.get(key)

        if (archeType === undefined) {
            archeType = {
                components,
                entities: new Map<number, EntityInternal>(),

                componentToLists: new Map(),
                componentToChangeListeners: new Map(),

                lists: [],
                changeListeners: new WeakList(),
            }

            const lists = [...keyToEntityList.values()].filter(x =>
                requirementsSatisfyComponents(x.requirements, components),
            )

            for (const list of lists) {
                populateArcheTypeList(archeType, list)
            }

            for (const changeListener of entityChangeListeners.values()) {
                if (requirementsSatisfyComponents(changeListener.requirements, components)) {
                    populateArcheTypeChangeListener(archeType, changeListener)
                }
            }

            entityArcheTypes.set(key, archeType)
        }

        return archeType
    }

    // signals that a property changed from existing to not existing or vice versa
    function entityPropertyChanged(entity: EntityInternal, from: string, to: string) {
        const toRemove = entity.__archeType.componentToLists.get(from)

        if (toRemove) {
            for (const list of toRemove) {
                list.entities.delete(entity.__id)
            }
        }

        const notifyRemove = entity.__archeType.componentToChangeListeners.get(from)

        if (notifyRemove) {
            for (const listener of notifyRemove.values()) {
                if (listener.added.has(entity.__id)) {
                    listener.added.delete(entity.__id)
                } else {
                    listener.removed.set(entity.__id, { ...entity })
                }
            }
        }

        entity.__archeType.entities.delete(entity.__id)

        const key = componentsToKey(Object.getOwnPropertyNames(entity))

        entity.__key = key
        entity.__archeType = emplaceEntityArcheType(key, Object.getOwnPropertyNames(entity))
        entity.__archeType.entities.set(entity.__id, entity)

        const toAdd = entity.__archeType.componentToLists.get(to)

        if (toAdd) {
            for (const list of toAdd) {
                list.entities.set(entity.__id, entity)
            }
        }

        const notifyAdd = entity.__archeType.componentToChangeListeners.get(to)

        if (notifyAdd) {
            for (const listener of notifyAdd.values()) {
                if (listener.removed.has(entity.__id)) {
                    listener.removed.delete(entity.__id)
                } else {
                    listener.added.set(entity.__id, entity)
                }
            }
        }
    }

    type EntityInternal = {
        __internal: EntityInternal
        __entity: EntityInternal
        __id: number
        __key: string
        __archeType: EntityArcheType
    } & Record<string, any>

    interface EntityList {
        entities: Map<number, EntityInternal>
        requirements: string[]
    }

    interface ChangeListener {
        requirements: string[]

        added: Map<number, EntityInternal>
        removed: Map<number, EntityInternal>
    }

    interface EntityArcheType {
        components: string[]
        entities: Map<number, EntityInternal>

        componentToLists: Map<string, EntityList[]>
        componentToChangeListeners: Map<string, WeakList<ChangeListener>>

        lists: EntityList[]
        changeListeners: WeakList<ChangeListener>
    }

    let nextEntityId = 0

    const entityArcheTypes = new Map<string, EntityArcheType>()
    const entityChangeListeners = new WeakList<ChangeListener>()

    const keyToEntityList = new Map<string, EntityList>()
    const keyToSingle = new Map<string, any>()

    const entityProxyHandler: ProxyHandler<EntityInternal> = {
        set(target, p: string, newValue, receiver) {
            const exists = Reflect.has(target, p)
            const result = Reflect.set(target, p, newValue, receiver)

            if (exists) {
                return result
            }

            entityPropertyChanged(target, ModifierNot + p, p)

            return result
        },
        deleteProperty(target, p: string) {
            const result = Reflect.deleteProperty(target, p)

            if (result === false) {
                return false
            }

            entityPropertyChanged(target, p, ModifierNot + p)

            return result
        },
    }

    function create<K extends keyof Components>(base: any): EntityWith<Components, K> {
        const components = Object.getOwnPropertyNames(base)
        const key = componentsToKey(components)

        if (components.some(x => forbiddenKeys.includes(x))) {
            throw new Error("Invalid component name")
        }

        base.__internal = base
        base.__id = nextEntityId++
        base.__key = key
        base.__archeType = emplaceEntityArcheType(key, components)

        const entity: EntityInternal = new Proxy(base, entityProxyHandler)

        base.__entity = entity

        for (const list of entity.__archeType.lists) {
            list.entities.set(entity.__id, entity)
        }

        for (const changeListener of entity.__archeType.changeListeners.values()) {
            changeListener.added.set(entity.__id, entity)
        }

        base.__archeType.entities.add(entity)

        return entity as EntityWith<Components, K>
    }

    function remove(entityToResolve: any): void {
        const entity = entityToResolve as EntityInternal

        for (const list of entity.__archeType.lists) {
            list.entities.delete(entity.__id)
        }

        for (const changeListener of entity.__archeType.changeListeners.values()) {
            changeListener.removed.set(entity.__id, entity)
        }

        entity.__archeType.entities.delete(entity.__id)
    }

    function multiple<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): Iterable<EntityWith<Components, FilterModifier<C[number], Components>>> {
        const key = componentsToKey(requirements)
        const list = keyToEntityList.get(key)

        if (list) {
            return list.entities as any
        }

        const entities = new Map<number, EntityInternal>()
        const newList: EntityList = { entities, requirements }

        keyToEntityList.set(key, newList)

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const [id, entity] of archeType.entities) {
                    entities.set(id, entity)
                }

                populateArcheTypeList(archeType, newList)
            }
        }

        return entities.values() as Iterable<EntityWith<Components, any>>
    }

    function single<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): EntityWith<Components, FilterModifier<C[number], Components>> {
        const key = componentsToKey(requirements)
        const existing = keyToSingle.get(key)

        if (existing) {
            return existing
        }

        multiple<C>(...requirements)
        const list = keyToEntityList.get(key)!

        function ensureSingleEntity() {
            if (list.entities.size === 0) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" does not exist`,
                )
            }

            if (list.entities.size > 1) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" is not unique`,
                )
            }

            const [[, x]] = list.entities
            return x
        }

        const newSingle = new Proxy(
            {},
            {
                get: (_, prop: string) => ensureSingleEntity()[prop],
                set: (_, prop: string, value) => (ensureSingleEntity()[prop] = value),
                deleteProperty: (_, prop: string) => delete ensureSingleEntity()[prop],
                ownKeys: () => Reflect.ownKeys(ensureSingleEntity()),
            },
        )

        keyToSingle.set(key, newSingle)

        return newSingle as any
    }

    function changing<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): () => EntityChange<Components, FilterModifier<K[number], Components>> {
        const changeListener: ChangeListener = {
            requirements,
            added: new Map(),
            removed: new Map(),
        }

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const [id, entity] of archeType.entities) {
                    changeListener.added.set(id, entity)
                }

                populateArcheTypeChangeListener(archeType, changeListener)
            }
        }

        entityChangeListeners.push(changeListener)

        return () => {
            const added = changeListener.added.values() as IterableIterator<
                EntityWith<Components, any>
            >

            const removed = changeListener.removed.values() as IterableIterator<
                EntityWith<Components, any>
            >

            changeListener.added = new Map()
            changeListener.removed = new Map()

            return { added, removed }
        }
    }

    return {
        create,
        remove,
        multiple: multiple as any,
        single: single as any,
        changing: changing as any,
    }
}

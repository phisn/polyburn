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
    added: ReadonlySet<EntityWith<Components, C>>
    removed: ReadonlySet<EntityWith<Components, C>>
}

export interface EntityStore<Components extends object> {
    create<K extends keyof Components>(components: Pick<Components, K>): EntityWith<Components, K>
    remove<K extends keyof Components>(entity: EntityWith<Components, K>): void

    single<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): EntityWith<Components, FilterModifier<C[number], Components>>

    multiple<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): ReadonlySet<EntityWith<Components, FilterModifier<C[number], Components>>>

    changing<K extends ComponentsWithModifier<Components>[]>(
        ...components: K
    ): () => EntityChange<Components, FilterModifier<K[number], Components>>
}

class WeakList<T extends WeakKey> {
    private list: WeakRef<T>[] = []

    push(value: T) {
        this.list.push(new WeakRef(value))
    }

    [Symbol.iterator]() {
        this.clean()
        const values = this.list.map(x => x.deref()).filter(x => x !== undefined) as T[]
        return values[Symbol.iterator]()
    }

    get values() {
        this.clean()
        return this.list.map(x => x.deref()).filter(x => x !== undefined) as T[]
    }

    get length() {
        if (this.list.length === 0) {
            return 0
        }

        this.clean()
        return this.list.length
    }

    private clean() {
        this.list = this.list.filter(x => x.deref() !== undefined)
    }
}

interface EntityKeyCacheEntry {
    key: string
    filter(components: PropertyKey[]): boolean
}

class EntityKeyCache<T> {
    private emptyResult: T[] = []
    private componentsToKeys = new Map<PropertyKey, EntityKeyCacheEntry[]>()
    private keyToValues = new Map<string, T>()

    getValue(key: string) {
        return this.keyToValues.get(key)
    }

    insert(value: T, componentFilters: string[]) {
        componentFilters.sort()
        const key = componentFilters.join(",")

        const has: PropertyKey[] = []
        const not: PropertyKey[] = []

        for (const componentFilter of componentFilters) {
            if (componentFilter.startsWith(ModifierNot)) {
                not.push(componentFilter.slice(ModifierNot.length))
                continue
            }

            has.push(componentFilter)
        }

        for (const componentFilter of componentFilters) {
            const entry = {
                key,
                filter: (components: PropertyKey[]) => {
                    if (has.some(x => !components.includes(x))) {
                        return false
                    }

                    if (not.some(x => components.includes(x))) {
                        return false
                    }

                    return true
                },
            }

            let components = this.componentsToKeys.get(componentFilter)

            if (components === undefined) {
                components = []
                this.componentsToKeys.set(componentFilter, components)
            }

            components.push(entry)
        }

        this.keyToValues.set(key, value)
    }

    valuesThatRequire(has: string, withComponents: string[]) {
        const values = this.componentsToKeys
            .get(has)
            ?.filter(x => x.filter(withComponents))
            ?.map(x => this.keyToValues.get(x.key)!)

        if (values) {
            return values
        }

        return this.emptyResult
    }

    valuesThatRequireNot(not: string, components: string[]) {
        return this.valuesThatRequire(`${ModifierNot}${not}`, components)
    }
}

class EntityListCache {
    private entityListKeyCache = new EntityKeyCache<any[]>()
    private requireNothing: any[][] = []

    insert(entities: any[], componentFilters: string[]) {
        this.entityListKeyCache.insert(entities, componentFilters)

        if (componentFilters.filter(x => !x.startsWith(ModifierNot)).length === 0) {
            this.requireNothing.push(entities)
        }
    }

    get(key: string) {
        return this.entityListKeyCache.getValue(key)
    }

    notifyCreateComponent(entity: any, newComponent: string) {
        const components = Object.getOwnPropertyNames(entity)

        const toAdd = this.entityListKeyCache.valuesThatRequire(newComponent, components)

        for (const entityList of toAdd) {
            entityList.push(entity)
        }

        const toRemove = this.entityListKeyCache.valuesThatRequireNot(newComponent, components)

        for (const entityList of toRemove) {
            entityList.splice(entityList.indexOf(entity), 1)
        }
    }

    notifyRemoveComponent(entity: any, removedComponent: string) {
        const components = Object.getOwnPropertyNames(entity)

        const toRemove = this.entityListKeyCache.valuesThatRequire(removedComponent, components)

        for (const entityList of toRemove) {
            entityList.splice(entityList.indexOf(entity), 1)
        }

        const toAdd = this.entityListKeyCache.valuesThatRequireNot(removedComponent, components)

        for (const entityList of toAdd) {
            entityList.push(entity)
        }
    }

    notifyCreate(entity: any) {
        for (const entityList of this.requireNothing) {
            entityList.push(entity)
        }
    }
}

class EntityChangeCache {
    private entityListKeyCache = new EntityKeyCache<WeakList<EntityChange<any, any>[]>>()

    emplace(componentFilters: string[]) {
        let list = this.entityListKeyCache.getValue(componentFilters.join(","))

        if (list === undefined) {
            list = new WeakList()
            this.entityListKeyCache.insert(list, componentFilters)
        }

        return list
    }

    get(key: string) {
        return this.entityListKeyCache.getValue(key)
    }

    notifyCreateComponent(entity: any, newComponent: string) {
        this.notifyChange(entity, `${ModifierNot}${newComponent}`, newComponent)
    }

    notifyRemoveComponent(entity: any, removedComponent: string) {
        this.notifyChange(entity, removedComponent, `${ModifierNot}${removedComponent}`)
    }

    private notifyChange(entity: any, previousComponent: string, newComponent: string) {
        const components = Object.getOwnPropertyNames(entity)

        const created = this.entityListKeyCache.valuesThatRequire(newComponent, components)

        for (const bucket of created) {
            for (const listener of bucket) {
                const exists = listener.findIndex(change => change.entity === entity)

                if (exists) {
                    listener.splice(exists, 1)
                }

                listener.push({ type: "created", entity: { ...entity } })
            }
        }

        const removed = this.entityListKeyCache.valuesThatRequire(previousComponent, components)

        for (const bucket of removed) {
            for (const listener of bucket) {
                listener.push({ type: "removed", entity: { ...entity } })
            }
        }
    }
}

// we assume if it is accessed once it will be accessed again. we dont care
// about disposing. the runtime should instead be created again

// we also dont really try to correctly type all components internally because
// it is not worth the effort. we just assume that the components are correct
export function newEntityStore<Components extends object>() {
    let nextId = 0

    const entityListKeyCache = new EntityListCache()
    const entityChangeCache = new EntityChangeCache()

    const entities = new Map<number, any>()

    // a single is an entity which only exists once. this is guranteed in its access
    // the user has to semantically ensure that the entity actually exists
    const singles = new Map<string, any>()

    function create<K extends keyof Components>(components: any): EntityWith<Components, K> {
        const componentNames = Object.getOwnPropertyNames(components)

        if (componentNames.length === 0) {
            throw new Error("No components provided")
        }

        const entity: any = new Proxy(
            {
                __id: nextId++,
                ...components,
            },
            {
                set(target: any, key: string, value) {
                    const isNewKey = !(key in target)

                    if (!Reflect.set(target, key, value)) {
                        return false
                    }

                    if (isNewKey) {
                        entityListKeyCache.notifyCreateComponent(entity, key)
                        entityChangeCache.notifyCreateComponent(entity, key)
                    }

                    return true
                },
                deleteProperty(target, key: string) {
                    if (key in target === false) {
                        return false
                    }

                    entityListKeyCache.notifyRemoveComponent(entity, key)
                    entityChangeCache.notifyRemoveComponent(entity, key)

                    return Reflect.deleteProperty(target, key)
                },
            },
        )

        entities.set(entity.__id, entity)

        /*
        for (const component of componentNames) {
            entity[component] = components[component]
        }
        */

        return entity
    }

    function remove(entity: EntityWith<Components, keyof Components>) {
        if (entities.delete((entity as any).__id)) {
            // remove entity from all lists implicitly by removing the properties. this also
            // prevents users from accidentally accessing the entity after it was removed
            for (const component of Object.getOwnPropertyNames(entity)) {
                Reflect.deleteProperty(entity, component)
            }
        }
    }

    function single<C extends ComponentsWithModifier<Components>[]>(
        ...componentsWithModifier: string[]
    ): EntityWith<Components, FilterModifier<C[number], Components>> {
        componentsWithModifier.sort()
        const key = componentsWithModifier.join(",")
        const existing = singles.get(key)

        if (existing) {
            return existing
        }

        let entityList = entityListKeyCache.get(key)

        if (entityList === undefined) {
            entityList = multiple(...componentsWithModifier) as any[]
        }

        function ensureSingleEntity() {
            if (entityList!.length < 1) {
                throw new Error(
                    `Single entity with components "${componentsWithModifier.join(", ")}" does not exist`,
                )
            }

            if (entityList!.length > 1) {
                throw new Error(
                    `Single entity with components "${componentsWithModifier.join(", ")}" is not unique`,
                )
            }

            return entityList![0]
        }

        const newSingle = new Proxy(
            {} as EntityWith<Components, FilterModifier<C[number], Components>>,
            {
                get: (_, prop) => ensureSingleEntity()[prop],
                set: (_, prop, value) => (ensureSingleEntity()[prop] = value),
                deleteProperty: (_, prop) => delete ensureSingleEntity()[prop],
                ownKeys: () => Reflect.ownKeys(ensureSingleEntity()),
            },
        )

        singles.set(key, newSingle)

        return newSingle
    }

    function multiple<C extends ComponentsWithModifier<Components>[]>(
        ...componentsWithModifier: string[]
    ): readonly EntityWith<Components, FilterModifier<C[number], Components>>[] {
        componentsWithModifier.sort()
        const key = componentsWithModifier.join(",")
        const entityList = entityListKeyCache.get(key)

        if (entityList) {
            return entityList
        }

        function filterComponentsWithModifier(modifier: string) {
            return componentsWithModifier
                .filter(x => x.startsWith(modifier))
                .map(x => x.slice(modifier.length))
        }

        const componentsRequired = componentsWithModifier.filter(x => !x.startsWith("not-"))
        const componentsForbidden = filterComponentsWithModifier("not-")

        const newEntityList: any[] = []
        entityListKeyCache.insert(newEntityList, componentsWithModifier)

        for (const [, entity] of entities) {
            const entityComponents = Object.getOwnPropertyNames(entity)

            if (
                componentsRequired.every(x => entityComponents.includes(x)) &&
                componentsForbidden.every(x => !entityComponents.includes(x))
            ) {
                newEntityList.push(entity)
            }
        }

        return newEntityList
    }

    function changing<K extends ComponentsWithModifier<Components>[]>(
        ...components: string[]
    ): () => EntityChange<Components, FilterModifier<K[number], Components>>[] {
        const changeLists = entityChangeCache.emplace(components)
        const changeList: EntityChange<any, any>[] = []

        changeLists.push(changeList)

        for (const entity of multiple(...components)) {
            changeList.push({ type: "created", entity: { ...entity } })
        }

        return () => {
            if (changeList.length === 0) {
                return []
            }

            const changes = [...changeList]
            changeList.length = 0
            return changes
        }
    }

    return { create, remove, single, multiple, changing }
}

class WeakList2<T extends WeakKey> {
    private list: WeakRef<T>[] = []

    push(value: T) {
        this.list.push(new WeakRef(value))
    }

    *values() {
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
    }
}

export function newEntityStore2<Components extends object>(): EntityStore<Components> {
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
                componentToChangeListener = new WeakList2()
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
                entities: new Set<EntityInternal>(),

                componentToLists: new Map(),
                componentToChangeListeners: new Map(),

                lists: [],
                changeListeners: new WeakList2(),
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

    function resolveEntity(entityToResolve: any): EntityInternal {
        const id = entityToResolve.__id

        if (id === undefined) {
            throw new Error("Invalid entity")
        }

        const entity = entities.get(id)

        if (entity === undefined) {
            throw new Error("Entity does not exist")
        }

        return entity
    }

    // signals that a property changed from existing to not existing or vice versa
    function entityPropertyChanged(entity: EntityInternal, from: string, to: string) {
        const toRemove = entity.__archeType.componentToLists.get(from)

        if (toRemove) {
            for (const list of toRemove) {
                list.entities.delete(entity.__entity)
            }
        }

        const notifyRemove = entity.__archeType.componentToChangeListeners.get(from)

        if (notifyRemove) {
            for (const listener of notifyRemove.values()) {
                if (listener.added.has(entity.__entity)) {
                    listener.added.delete(entity.__entity)
                } else {
                    listener.removed.add(entity.__entity)
                }
            }
        }

        entity.__archeType.entities.delete(entity.__entity)

        const key = componentsToKey(Object.getOwnPropertyNames(entity))

        entity.__key = key
        entity.__archeType = emplaceEntityArcheType(key, Object.getOwnPropertyNames(entity))
        entity.__archeType.entities.add(entity.__entity)

        const toAdd = entity.__archeType.componentToLists.get(to)

        if (toAdd) {
            for (const list of toAdd) {
                list.entities.add(entity.__entity)
            }
        }

        const notifyAdd = entity.__archeType.componentToChangeListeners.get(to)

        if (notifyAdd) {
            for (const listener of notifyAdd.values()) {
                if (listener.removed.has(entity.__entity)) {
                    listener.removed.delete(entity.__entity)
                } else {
                    listener.added.add(entity.__entity)
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
        entities: Set<EntityInternal>
        requirements: string[]
    }

    interface ChangeListener {
        requirements: string[]

        added: Set<EntityInternal>
        removed: Set<EntityInternal>
    }

    interface EntityArcheType {
        components: string[]
        entities: Set<EntityInternal>

        componentToLists: Map<string, EntityList[]>
        componentToChangeListeners: Map<string, WeakList2<ChangeListener>>

        lists: EntityList[]
        changeListeners: WeakList2<ChangeListener>
    }

    let nextEntityId = 0

    const entityArcheTypes = new Map<string, EntityArcheType>()
    const entityChangeListeners = new WeakList2<ChangeListener>()

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
            list.entities.add(entity.__entity)
        }

        for (const changeListener of entity.__archeType.changeListeners.values()) {
            changeListener.added.add(entity.__entity)
        }

        base.__archeType.entities.add(entity)

        return entity as EntityWith<Components, K>
    }

    function remove(entityToResolve: any): void {
        const entity = entityToResolve as EntityInternal

        for (const list of entity.__archeType.lists) {
            list.entities.delete(entity.__entity)
        }

        for (const changeListener of entity.__archeType.changeListeners.values()) {
            changeListener.removed.add({ ...entity.__internal })
        }

        entity.__archeType.entities.delete(entity.__entity)
    }

    function multiple<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): ReadonlySet<EntityWith<Components, FilterModifier<C[number], Components>>> {
        const key = componentsToKey(requirements)
        const list = keyToEntityList.get(key)

        if (list) {
            return list.entities as any
        }

        const entities = new Set<EntityInternal>()
        const newList: EntityList = { entities, requirements }

        keyToEntityList.set(key, newList)

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const entity of archeType.entities) {
                    entities.add(entity)
                }

                populateArcheTypeList(archeType, newList)
            }
        }

        return entities as any
    }

    function single<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): EntityWith<Components, FilterModifier<C[number], Components>> {
        const key = componentsToKey(requirements)
        const existing = keyToSingle.get(key)

        if (existing) {
            return existing
        }

        const list: ReadonlySet<any> = multiple<C>(...requirements)

        function ensureSingleEntity() {
            if (list.size < 1) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" does not exist`,
                )
            }

            if (list.size > 1) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" is not unique`,
                )
            }

            const [x] = list
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

    function changing(...requirements: string[]) {
        const changeListener: ChangeListener = {
            requirements,
            added: new Set(),
            removed: new Set(),
        }

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const entity of archeType.entities) {
                    changeListener.added.add(entity)
                }

                populateArcheTypeChangeListener(archeType, changeListener)
            }
        }

        entityChangeListeners.push(changeListener)

        return () => {
            const added = changeListener.added
            const removed = changeListener.removed

            changeListener.added = new Set()
            changeListener.removed = new Set()

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

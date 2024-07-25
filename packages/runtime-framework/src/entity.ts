export interface Entity<Type, Components extends Type> {
    get id(): number

    get<K extends keyof Type>(component: K): Type[K]

    set<K extends keyof Components>(
        component: K,
        value: Components[K],
    ): Entity<Pick<Components, K> & Type, Components>

    has<K extends keyof Components>(
        component: K,
    ): this is Entity<Pick<Components, K> & Type, Components>

    delete<K extends keyof Components>(component: K): Entity<Omit<Type, K>, Components>
}

export type EntityWith<Components extends object, C extends keyof Components> = Entity<
    Pick<Components, C>,
    Components
>

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
    added: EntityWith<Components, C>[]
    removed: EntityWith<Components, C>[]
}

export interface EntityStore<Components extends object> {
    create<K extends keyof Components>(components: Pick<Components, K>): EntityWith<Components, K>

    remove<K extends keyof Components>(entity: EntityWith<Components, K>): void

    single<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): EntityWith<Components, FilterModifier<C[number], Components>>

    multiple<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): readonly EntityWith<Components, FilterModifier<C[number], Components>>[]

    changing<K extends ComponentsWithModifier<Components>[]>(
        ...components: K
    ): () => EntityChange<Components, FilterModifier<K[number], Components>>
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
    function componentsToKey(components: string[]) {
        return components.sort().join(",")
    }

    function requirementsSatisfyComponents(
        requirements: readonly string[],
        components: readonly string[],
    ) {
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

    function populateArcheTypeList(archeType: EntityArcheType, entityList: EntityList) {
        archeType.multipleInstances.push(entityList)

        for (const requirement of entityList.requirements) {
            let componentToList = archeType.componentToLists.get(requirement)

            if (componentToList === undefined) {
                componentToList = []
                archeType.componentToLists.set(requirement, componentToList)
            }

            componentToList.push(entityList)
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

                multipleInstances: [],
                changeListeners: new WeakList(),
            }

            const lists = [...keyToMultipleInstance.values()].filter(x =>
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
        const toRemove = entity.archeType.componentToLists.get(from)

        if (toRemove) {
            for (const list of toRemove) {
                list.remove(entity)
            }
        }

        const notifyRemove = entity.archeType.componentToChangeListeners.get(from)

        if (notifyRemove) {
            for (const listener of notifyRemove.values()) {
                listener.notifyRemoved(entity)
            }
        }

        entity.archeType.entities.delete(entity.id)

        entity.key = componentsToKey(Object.getOwnPropertyNames(entity.components))

        entity.archeType = emplaceEntityArcheType(
            entity.key,
            Object.getOwnPropertyNames(entity.components),
        )

        entity.archeType.entities.set(entity.id, entity)

        const toAdd = entity.archeType.componentToLists.get(to)

        if (toAdd) {
            for (const list of toAdd) {
                list.push(entity)
            }
        }

        const notifyAdd = entity.archeType.componentToChangeListeners.get(to)

        if (notifyAdd) {
            for (const listener of notifyAdd.values()) {
                listener.notifyAdded(entity)
            }
        }
    }

    interface EntityInternal {
        id: number
        key: string

        components: Record<string, unknown>
        archeType: EntityArcheType

        facade: Entity<any, Components>
    }

    class EntityList {
        private _entities: Entity<any, Components>[]
        private _entityToIndex: Map<number, number>
        private _requirements: string[]

        constructor(requirements: string[]) {
            this._requirements = requirements
            this._entities = []
            this._entityToIndex = new Map()
        }

        get entities(): readonly Entity<any, Components>[] {
            return this._entities
        }

        get requirements(): readonly string[] {
            return this._requirements
        }

        push(entity: EntityInternal) {
            this._entities.push(entity.facade)
            this._entityToIndex.set(entity.id, this._entities.length - 1)
        }

        remove(entity: EntityInternal) {
            const index = this._entityToIndex.get(entity.id)

            if (index === undefined) {
                throw new Error("Entity not found in list")
            }

            const last = this._entities.pop()!

            if (index !== this._entities.length) {
                this._entities[index] = last
                this._entityToIndex.set(last.id, index)
            }

            this._entityToIndex.delete(entity.id)
        }

        has(entity: EntityInternal) {
            return this._entityToIndex.has(entity.id)
        }

        pop() {
            const temp = this._entities
            this._entities = []
            this._entityToIndex.clear()
            return temp
        }
    }

    class ChangeListener {
        private _added: EntityList
        private _removed: EntityList

        constructor(requirements: string[]) {
            this._added = new EntityList(requirements)
            this._removed = new EntityList(requirements)
        }

        get added() {
            return this._added.entities
        }

        get removed() {
            return this._removed.entities
        }

        get requirements() {
            return this._added.requirements
        }

        notifyAdded(entity: EntityInternal) {
            if (this._removed.has(entity)) {
                this._removed.remove(entity)
            } else {
                this._added.push(entity)
            }
        }

        notifyRemoved(entity: EntityInternal) {
            if (this._added.has(entity)) {
                this._added.remove(entity)
            } else {
                this._removed.push(entity)
            }
        }

        pop() {
            return {
                added: this._added.pop(),
                removed: this._removed.pop(),
            }
        }
    }

    interface EntityArcheType {
        components: string[]
        entities: Map<number, EntityInternal>

        componentToLists: Map<string, EntityList[]>
        componentToChangeListeners: Map<string, WeakList<ChangeListener>>

        multipleInstances: EntityList[]
        changeListeners: WeakList<ChangeListener>
    }

    let nextEntityId = 0
    const entities = new Map<number, EntityInternal>()

    const entityArcheTypes = new Map<string, EntityArcheType>()
    const entityChangeListeners = new WeakList<ChangeListener>()

    const keyToMultipleInstance = new Map<string, EntityList>()
    const keyToSingle = new Map<string, any>()

    function create<K extends keyof Components>(base: unknown): EntityWith<Components, K> {
        const components = Object.getOwnPropertyNames(base)
        const key = componentsToKey(components)

        const entity: EntityInternal = {
            id: nextEntityId++,
            key,

            components: base as any,
            archeType: emplaceEntityArcheType(key, components),

            facade: {
                get id() {
                    return entity.id
                },
                get(component: string) {
                    if (component in entity.components === false) {
                        throw new Error("Component not found")
                    }

                    return entity.components[component]
                },
                set(component: string, value: any) {
                    const exists = component in entity.components
                    entity.components[component] = value

                    if (exists === false) {
                        entityPropertyChanged(entity, ModifierNot + component, component)
                    }

                    return entity.facade
                },
                has(component: string) {
                    return component in entity.components
                },
                delete(component: string) {
                    const result = delete entity.components[component]

                    if (result) {
                        entityPropertyChanged(entity, component, ModifierNot + component)
                    }

                    return result
                },

                // very ugly that we have to cast here. but has method
                // wont work without it and complexity is manageable
            } as any,
        }

        for (const list of entity.archeType.multipleInstances) {
            list.push(entity)
        }

        for (const changeListener of entity.archeType.changeListeners.values()) {
            changeListener.notifyAdded(entity)
        }

        entity.archeType.entities.set(entity.id, entity)
        entities.set(entity.id, entity)

        return entity.facade
    }

    function remove(entity: Entity<any, Components>): void {
        const internalEntity = entities.get(entity.id)

        if (internalEntity === undefined) {
            throw new Error("Entity not found")
        }

        for (const list of internalEntity.archeType.multipleInstances) {
            list.remove(internalEntity)
        }

        for (const changeListener of internalEntity.archeType.changeListeners.values()) {
            changeListener.notifyRemoved(internalEntity)
        }

        internalEntity.archeType.entities.delete(internalEntity.id)
        entities.delete(internalEntity.id)
    }

    function multiple<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): readonly EntityWith<Components, FilterModifier<C[number], Components>>[] {
        const key = componentsToKey(requirements)
        const multipleInstance = keyToMultipleInstance.get(key)

        if (multipleInstance) {
            return multipleInstance.entities
        }

        const newEntityList = new EntityList(requirements)
        keyToMultipleInstance.set(key, newEntityList)

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const [, entity] of archeType.entities) {
                    newEntityList.push(entity)
                }

                populateArcheTypeList(archeType, newEntityList)
            }
        }

        return newEntityList.entities
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
        const list = keyToMultipleInstance.get(key)!

        function ensureSingleEntity() {
            if (list.entities.length === 0) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" does not exist`,
                )
            }

            if (list.entities.length > 1) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" is not unique`,
                )
            }

            const [x] = list.entities
            return x
        }

        const newSingle: Entity<any, Components> = {
            get id() {
                return ensureSingleEntity().id
            },
            get(component: string) {
                return ensureSingleEntity().get(component)
            },
            set(component: string, value: any) {
                return ensureSingleEntity().set(component as any, value)
            },
            has(component: string) {
                return ensureSingleEntity().has(component as any)
            },
            delete(component: string) {
                return ensureSingleEntity().delete(component as any)
            },

            // very ugly that we have to cast here. but has method
            // wont work without it and complexity is manageable
        } as any

        keyToSingle.set(key, newSingle)

        return newSingle as any
    }

    function changing<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): () => EntityChange<Components, FilterModifier<K[number], Components>> {
        const changeListener: ChangeListener = new ChangeListener(requirements)

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const [, entity] of archeType.entities) {
                    changeListener.notifyAdded(entity)
                }

                populateArcheTypeChangeListener(archeType, changeListener)
            }
        }

        entityChangeListeners.push(changeListener)

        return () => changeListener.pop()
    }

    return {
        create,
        remove,
        multiple: multiple as any,
        single: single as any,
        changing: changing as any,
    }
}

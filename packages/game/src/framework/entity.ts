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

type Listener<K extends ComponentsWithModifier<Components>[], Components extends object> = (
    entity: EntityWith<Components, FilterModifier<K[number], Components>>,
) => void

export interface EntityStore<Components extends object> {
    create<K extends keyof Components>(components: Pick<Components, K>): EntityWith<Components, K>

    remove<K extends keyof Components>(entity: number | EntityWith<Components, K>): void

    listen<K extends ComponentsWithModifier<Components>[]>(
        requirements: [...K],
        notifyAdded: Listener<K, Components>,
        notifyRemoved: Listener<K, Components>,
    ): () => void

    multiple<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: K
    ): readonly EntityWith<Components, FilterModifier<K[number], Components>>[]

    single<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: K
    ): () => EntityWith<Components, FilterModifier<K[number], Components>>

    changing<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: K
    ): () => EntityChange<Components, FilterModifier<K[number], Components>>
}

export interface EntityStoreScoped<Components extends object> extends EntityStore<Components> {
    clear(): void
}

class WeakLookup<K, T extends WeakKey> {
    private map = new Map<K, WeakRef<T>>()
    private inUse = false

    set(key: K, value: any) {
        this.map.set(key, new WeakRef(value))
    }

    get(key: K) {
        const value = this.map.get(key)

        if (value === undefined) {
            return undefined
        }

        const result = value.deref()

        if (result === undefined) {
            this.map.delete(key)
        }

        return result
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

    function populateArcheTypeListener(archeType: EntityArcheType, listener: ListenerBatch) {
        archeType.listenerBatches.push(listener)

        for (const requirement of listener.requirements) {
            let componentToListener = archeType.componentToListenerBatches.get(requirement)

            if (componentToListener === undefined) {
                componentToListener = []
                archeType.componentToListenerBatches.set(requirement, componentToListener)
            }

            componentToListener.push(listener)
        }
    }

    function emplaceEntityArcheType(key: string, components: string[]) {
        let archeType = entityArcheTypes.get(key)

        if (archeType === undefined) {
            archeType = {
                components,
                entities: new Map<number, EntityInternal>(),

                componentToListenerBatches: new Map(),
                listenerBatches: [],
            }

            for (const [, listener] of listenerBatches) {
                if (requirementsSatisfyComponents(listener.requirements, components)) {
                    populateArcheTypeListener(archeType, listener)
                }
            }

            entityArcheTypes.set(key, archeType)
        }

        return archeType
    }

    // signals that a property changed from existing to not existing or vice versa
    function entityPropertyChanged(entity: EntityInternal, from: string, to: string) {
        const listenersToRemove = entity.archeType.componentToListenerBatches.get(from)

        if (listenersToRemove) {
            for (const listener of listenersToRemove) {
                listener.notifyRemoved(entity.facade)
            }
        }

        entity.archeType.entities.delete(entity.id)

        entity.key = componentsToKey(Object.getOwnPropertyNames(entity.components))

        entity.archeType = emplaceEntityArcheType(
            entity.key,
            Object.getOwnPropertyNames(entity.components),
        )

        entity.archeType.entities.set(entity.id, entity)

        const listenersToAdd = entity.archeType.componentToListenerBatches.get(to)

        if (listenersToAdd) {
            for (const listener of listenersToAdd) {
                listener.notifyAdded(entity.facade)
            }
        }
    }

    interface EntityInternal {
        id: number
        key: string

        components: Record<string, any>
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

        push(entity: Entity<any, Components>) {
            this._entities.push(entity)
            this._entityToIndex.set(entity.id, this._entities.length - 1)
        }

        remove(entity: Entity<any, Components>) {
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

        has(entity: Entity<any, Components>) {
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

        notifyAdded(entity: Entity<any, Components>) {
            if (this._removed.has(entity)) {
                this._removed.remove(entity)
            } else {
                this._added.push(entity)
            }
        }

        notifyRemoved(entity: Entity<any, Components>) {
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

    class ListenerBatch {
        private added: Map<symbol, Listener<ComponentsWithModifier<Components>[], Components>>
        private removed: Map<symbol, Listener<ComponentsWithModifier<Components>[], Components>>

        constructor(private _requirements: string[]) {
            this.added = new Map()
            this.removed = new Map()
        }

        get requirements(): readonly string[] {
            return this._requirements
        }

        add(
            notifyAdded: Listener<ComponentsWithModifier<Components>[], Components>,
            notifyRemoved: Listener<ComponentsWithModifier<Components>[], Components>,
        ): symbol {
            const symbol = Symbol()

            this.added.set(symbol, notifyAdded)
            this.removed.set(symbol, notifyRemoved)

            return symbol
        }

        remove(symbol: symbol) {
            this.added.delete(symbol)
            this.removed.delete(symbol)
        }

        notifyAdded(entity: Entity<any, Components>) {
            for (const [, listener] of this.added) {
                listener(entity)
            }
        }

        notifyRemoved(entity: Entity<any, Components>) {
            for (const [, listener] of this.removed) {
                listener(entity)
            }
        }
    }

    interface EntityArcheType {
        components: string[]
        entities: Map<number, EntityInternal>

        componentToListenerBatches: Map<string, ListenerBatch[]>
        listenerBatches: ListenerBatch[]
    }

    let nextEntityId = 0
    const entities = new Map<number, EntityInternal>()

    const entityArcheTypes = new Map<string, EntityArcheType>()
    const listenerBatches = new Map<string, ListenerBatch>()

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

        for (const listener of entity.archeType.listenerBatches) {
            listener.notifyAdded(entity.facade)
        }

        entity.archeType.entities.set(entity.id, entity)
        entities.set(entity.id, entity)

        return entity.facade
    }

    function remove(entity: number | Entity<any, Components>): void {
        entity = typeof entity === "object" ? entity.id : entity

        const internalEntity = entities.get(entity)

        if (internalEntity === undefined) {
            throw new Error("Entity not found")
        }

        for (const listener of internalEntity.archeType.listenerBatches) {
            listener.notifyRemoved(internalEntity.facade)
        }

        internalEntity.archeType.entities.delete(internalEntity.id)
        entities.delete(internalEntity.id)
    }

    function listen<K extends ComponentsWithModifier<Components>[]>(
        requirements: string[],
        notifyAdded: Listener<K, Components>,
        notifyRemoved: Listener<K, Components>,
    ): () => void {
        const key = componentsToKey(requirements)
        const existing = listenerBatches.get(key)

        if (existing) {
            const symbol = existing.add(notifyAdded, notifyRemoved)
            return () => void existing.remove(symbol)
        }

        const newListener = new ListenerBatch(requirements)
        listenerBatches.set(key, newListener)
        const symbol = newListener.add(notifyAdded, notifyRemoved)

        for (const archeType of entityArcheTypes.values()) {
            if (requirementsSatisfyComponents(requirements, archeType.components)) {
                for (const [, entity] of archeType.entities) {
                    newListener.notifyAdded(entity.facade)
                }

                populateArcheTypeListener(archeType, newListener)
            }
        }

        return () => void newListener.remove(symbol)
    }

    const multiples = new WeakLookup<string, readonly Entity<any, Components>[]>()

    function multiple<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): readonly EntityWith<Components, FilterModifier<C[number], Components>>[] {
        const key = componentsToKey(requirements)
        const existing = multiples.get(key)

        if (existing) {
            return existing
        }

        const entityList = new EntityList(requirements)
        const entityListRef = new WeakRef(entityList)

        const unlisten = listen(
            requirements,
            entity => {
                const entityList = entityListRef.deref()

                if (entityList === undefined) {
                    unlisten()
                    return
                }

                entityList.push(entity)
            },
            entity => {
                const result = entityListRef.deref()

                if (result === undefined) {
                    unlisten()
                    return
                }

                result.remove(entity)
            },
        )

        multiples.set(key, entityList.entities)

        return entityList.entities
    }

    const keyToSingle = new WeakLookup<string, any>()

    function single<C extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): () => EntityWith<Components, FilterModifier<C[number], Components>> {
        const key = componentsToKey(requirements)
        const existing = keyToSingle.get(key)

        if (existing) {
            return existing
        }

        multiple<C>(...requirements)
        const list = multiples.get(key)!

        function ensureSingleEntity() {
            if (list.length === 0) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" does not exist`,
                )
            }

            if (list.length > 1) {
                throw new Error(
                    `Single entity with components "${requirements.join(", ")}" is not unique`,
                )
            }

            const [x] = list
            return x
        }

        const newSingle = () => ensureSingleEntity()

        keyToSingle.set(key, newSingle)

        return newSingle
    }

    function changing<K extends ComponentsWithModifier<Components>[]>(
        ...requirements: string[]
    ): () => EntityChange<Components, FilterModifier<K[number], Components>> {
        const changeListener = new ChangeListener(requirements)

        const result = () => changeListener.pop()
        const resultRef = new WeakRef(result)

        const unlisten = listen(
            requirements,
            entity => {
                if (resultRef.deref() === undefined) {
                    unlisten()
                    return
                }

                changeListener.notifyAdded(entity)
            },
            entity => {
                if (resultRef.deref() === undefined) {
                    unlisten()
                    return
                }

                changeListener.notifyRemoved(entity)
            },
        )

        return result
    }

    return {
        create,
        remove,
        listen: listen as any,
        multiple: multiple as any,
        single: single as any,
        changing: changing as any,
    }
}

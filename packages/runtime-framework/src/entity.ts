export type EntityWith<Components extends object, C extends keyof Components> = Pick<
    Components,
    C
> &
    Partial<Components>

const ModifierNot = "not-"

const Modifiers = [ModifierNot] as const
type Modifiers = (typeof Modifiers)[number]

// => keyof Components & "not-" + keyof Components
type ComponentsWithModifier<Components extends object> =
    | keyof Components
    | `${Modifiers}${keyof Components & string}`

// filter the result of ComponentsWithModifier so that it is keyof Components
type FilterModifier<
    C extends string | number | symbol,
    Components extends object,
> = C extends keyof Components ? C : never

export interface EntityStore<Components extends object> {
    create<K extends keyof Components>(components: Pick<Components, K>): EntityWith<Components, K>
    remove<K extends keyof Components>(entity: EntityWith<Components, K>): void

    single<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): EntityWith<Components, FilterModifier<C[number], Components>>

    multiple<C extends ComponentsWithModifier<Components>[]>(
        ...components: C
    ): readonly EntityWith<Components, FilterModifier<C[number], Components>>[]

    // works using a weak set. if the callee does not reference the function it will be garbage collected
    // will return all new entities created/removed since the last call
    /*
    created<K extends ComponentsWithModifier<Components>[]>(
        ...components: K
    ): () => EntityWith<Components, FilterModifier<K[number], Components>>[]
    removed<K extends ComponentsWithModifier<Components>[]>(
        ...components: K
    ): () => EntityWith<Components, FilterModifier<K[number], Components>>[]
    */
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

    getValue(components: string[]) {
        return this.keyToValues.get(this.keyFromComponents(components))
    }

    insert(value: T, componentFilters: string[]) {
        const key = this.keyFromComponents(componentFilters)

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

    private keyFromComponents(components: string[]) {
        return components.toSorted().join(",")
    }
}

// we assume if it is accessed once it will be accessed again. we dont care
// about disposing. the runtime should instead be created again

// we also dont really try to correctly type all components internally because
// it is not worth the effort. we just assume that the components are correct
export function newEntityStore<Components extends object>() {
    let nextId = 0

    const entityListKeyCache = new EntityKeyCache<any[]>()
    const createdKeyCache = new EntityKeyCache<WeakList<any[]>>()
    const removedKeyCache = new EntityKeyCache<WeakList<any[]>>()

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
            },
            {
                set(target: any, key: string, value) {
                    const isNewKey = !(key in target)

                    if (!Reflect.set(target, key, value)) {
                        return false
                    }

                    if (isNewKey) {
                        const targetComponents = Object.getOwnPropertyNames(target)

                        const toAdd = entityListKeyCache.valuesThatRequire(key, targetComponents)

                        for (const entityList of toAdd) {
                            console.log(entityList)
                            entityList.push(entity)
                        }

                        const toRemove = entityListKeyCache.valuesThatRequireNot(
                            key,
                            targetComponents,
                        )

                        for (const entityList of toRemove) {
                            entityList.splice(entityList.indexOf(entity), 1)
                        }

                        const toCreateListenerBuckets = createdKeyCache.valuesThatRequire(
                            key,
                            targetComponents,
                        )

                        for (const bucket of toCreateListenerBuckets) {
                            for (const listener of bucket) {
                                listener.push(entity)
                            }
                        }

                        const toRemoveListenerBuckets = removedKeyCache.valuesThatRequireNot(
                            key,
                            targetComponents,
                        )

                        for (const bucket of toRemoveListenerBuckets) {
                            for (const listener of bucket) {
                                listener.push(entity)
                            }
                        }
                    }

                    return true
                },
                deleteProperty(target, key) {
                    const toRemove = entityListKeyCache.valuesThatRequire(key, target)

                    if (!Reflect.deleteProperty(target, key)) {
                        return false
                    }

                    for (const entityList of toRemove) {
                        entityList.splice(entityList.indexOf(entity), 1)
                    }

                    const toRemoveListenerBuckets = removedKeyCache.findThatHas(key, target)

                    for (const bucket of toRemoveListenerBuckets) {
                        for (const listener of bucket) {
                            listener.push(entity)
                        }
                    }

                    return true
                },
            },
        )

        entities.set(entity.__id, entity)

        for (const component of componentNames) {
            entity[component] = components[component]
        }

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
        const key = componentsWithModifier.join(",")
        const existing = singles.get(key)

        if (existing) {
            return existing
        }

        let entityList = entityListKeyCache.getValue(key)

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
        const key = componentsWithModifier.join(",")
        const entityList = entityListKeyCache.getValue(key)

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

        // sanity check that does not really impact performance
        if (
            componentsRequired.filter(x => Modifiers.some(modifer => x.startsWith(modifer)))
                .length > 0
        ) {
            throw new Error("Unhandeled modifier")
        }

        const newEntityList: any[] = []
        entityListKeyCache.insert(newEntityList, key, componentsRequired)

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

    function eventCacheToFunction<K extends ComponentsWithModifier<Components>[]>(
        cache: EntityKeyCache<WeakList<any[]>>,
    ): (
        ...componentsWithModifier: K
    ) => () => EntityWith<Components, FilterModifier<K[number], Components>>[] {
        return (...componentsWithModifier) => {
            const key = componentsWithModifier.join(",")
            let existing = cache.getValue(key)

            if (existing === undefined) {
                existing = new WeakList()
                cache.insert(existing, key, componentsWithModifier)
            }

            const empty: any[] = []
            const created: any[] = []

            existing.push(created)

            return () => {
                if (created.length === 0) {
                    return empty
                }

                const result = created.slice()
                created.length = 0
                return result
            }
        }
    }

    const created = eventCacheToFunction(createdKeyCache)
    const removed = eventCacheToFunction(removedKeyCache)

    return { create, remove, single, multiple, created, removed }
}

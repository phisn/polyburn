export class ResourceStore<Resources extends object> {
    private resources: Partial<Resources> = {}

    get<K extends keyof Resources>(key: K): Resources[K] {
        if (!this.resources[key]) {
            throw new Error(`Resource ${key.toString()} not loaded`)
        }

        return this.resources[key]
    }

    set<K extends keyof Resources>(key: K, value: Resources[K]) {
        this.resources[key] = value
    }
}

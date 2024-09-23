export class ResourceStore<Resources extends object> {
    private resources: Partial<Resources>

    constructor(inital?: Partial<Resources>) {
        this.resources = inital ?? {}
    }

    get<K extends keyof Resources>(key: K): Resources[K] {
        if (!this.resources[key]) {
            throw new Error(`Resource ${key.toString()} not loaded`)
        }

        return this.resources[key] as Resources[K]
    }

    getOr<K extends keyof Resources, T>(key: K, defaultValue: T): Resources[K] | T {
        if (!this.resources[key]) {
            return defaultValue
        }

        return this.resources[key] as Resources[K]
    }

    set<K extends keyof Resources>(key: K, value: Resources[K]) {
        this.resources[key] = value
    }
}

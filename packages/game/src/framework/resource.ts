export class ResourceStore<Resources extends object> {
    private resources: Partial<Resources>

    constructor(inital?: Partial<Resources>) {
        this.resources = inital ?? {}
    }

    get<K extends keyof Resources>(key: K): Resources[K] {
        const resource = this.resources[key]

        if (!resource) {
            throw new Error(`Resource ${key.toString()} not loaded`)
        }

        return resource as Resources[K]
    }

    getOr<K extends keyof Resources, T>(key: K, defaultValue: T): Resources[K] | T {
        const resource = this.resources[key]

        if (!resource) {
            return defaultValue
        }

        return resource as Resources[K]
    }

    set<K extends keyof Resources>(key: K, value?: Resources[K]) {
        this.resources[key] = value
    }
}

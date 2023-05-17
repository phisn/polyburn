interface Components {
    [key: string]: unknown
}

export class RuntimeEntity {
    hasComponent(...components: string[]): boolean {
        return components.every(component => component in this.components)
    }

    getComponent<T>(component: string): T {
        return this.components[component] as T
    }

    addComponent<T>(component: string, value: T): RuntimeEntity {
        this.components[component] = value
        return this
    }

    private components: Components = {}
}

export interface Components {
    [key: string]: unknown
}

export interface RuntimeEntity {
    get components(): Components

    getComponent<T>(component: string): T
    addComponent<T>(component: string, value: T): RuntimeEntity
    removeComponent(component: string): RuntimeEntity
}

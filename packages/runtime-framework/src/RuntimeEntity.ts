export interface Components {
    [key: string]: unknown
}

export interface RuntimeEntity {
    get components(): Components
    get id(): number

    get<T>(component: string): T
    add<T>(component: string, value: T): RuntimeEntity
    remove(component: string): RuntimeEntity
}

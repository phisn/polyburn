export interface Components {
    [key: string]: unknown
}

export interface RuntimeEntity {
    get components(): Components
    get id(): number

    get<T>(component: string): T | undefined
    getSafe<T>(component: string): T 

    set<T>(component: string, value?: T): RuntimeEntity
    remove(component: string): RuntimeEntity
}

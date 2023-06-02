export interface Components {
    [key: string]: unknown
}

export interface Entity {
    get components(): Components
    get id(): number

    get<T>(component: string): T | undefined
    getSafe<T>(component: string): T
    getOrDefault<T>(component: string, def: T): T

    set<T>(component: string, value?: T): Entity
    remove(component: string): Entity
}

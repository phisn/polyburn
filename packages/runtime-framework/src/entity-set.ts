import { Entity } from "./entity"

export interface EntitySet<Components extends object> extends Iterable<Entity<Components>> {
    free(): void
    size(): number

    map<T>(callback: (entity: Entity<Components>) => T): T[]

    add<T extends keyof Components>(componentName: T, component: Components[T]): void
    remove<T extends keyof Components>(componentName: T): void

    toString(): string
}

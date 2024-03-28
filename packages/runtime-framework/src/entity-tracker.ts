import { Entity, EntityId } from "./entity"

export interface EntityTracker<Components extends object> extends Iterable<Entity<Components>> {
    free(): void

    onChange(callback: () => void): () => void

    add(...entities: Entity<Components>[]): void
    set(...entities: Entity<Components>[]): void
    delete(...entities: EntityId[]): void

    clear(): void

    components(): (keyof Components)[]
}

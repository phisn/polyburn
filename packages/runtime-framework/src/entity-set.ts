import { Entity } from "./entity"

export interface EntitySet<Components extends object> extends Iterable<Entity<Components>> {
    free(): void
}

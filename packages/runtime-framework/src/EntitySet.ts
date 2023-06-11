import { Entity } from "./Entity"

export interface EntitySet<Components extends object> extends Iterable<Entity<Components>> {
    free(): void
}

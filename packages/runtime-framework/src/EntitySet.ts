import { Entity } from "./Entity"

export interface EntitySet extends Iterable<Entity> {
    free(): void
}

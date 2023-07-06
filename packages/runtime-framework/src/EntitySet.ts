import { Entity } from "./Entity"

export type EntitySet<Components extends object> = Iterable<Entity<Components>>

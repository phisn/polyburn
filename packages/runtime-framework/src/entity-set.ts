import { Entity } from "./entity"

export type EntitySet<Components extends object> = Iterable<Entity<Components>>

import { EntityStore } from "./EntityStore"
import { System } from "./System"

export type SystemFactory<Meta, T> = (store: EntityStore, meta: Meta) => System<T> | void

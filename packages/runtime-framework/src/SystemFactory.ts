import { EntityStore } from "../src/EntityStore"
import { System } from "./System"

export type SystemFactory<Components extends object, Meta, Context> = (store: EntityStore<Components>, meta: Meta) => System<Context> | void

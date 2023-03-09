import { Entity } from "./Entity"
import { Shape } from "./Shape"

export interface World {
    shapes: Shape[]
    entities: Entity[]
}

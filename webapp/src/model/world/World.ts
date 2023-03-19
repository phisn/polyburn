import { Level } from "./entities/Level"
import { Rocket } from "./entities/Rocket"
import { Entity } from "./Entity"
import { Shape } from "./Shape"

export interface World {
    shapes: Shape[]

    levels: Level[]
    rockets: Rocket[]

    entities: Entity[]
}

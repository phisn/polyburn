
import LZString from "lz-string"

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

export function exportWorld(world: World): string {
    return LZString.compressToBase64("rw|" + JSON.stringify(world))
}

export function importWorld(world: string): World {
    const data = LZString.decompressFromBase64(world)

    if (!data) {
        throw new Error("Invalid world data")
    }

    if (!data.startsWith("rw|")) {
        throw new Error("Invalid world data")
    }
    
    return JSON.parse(data.substring(3))
}


import LZString from "lz-string"

import { Entity } from "./Entity"
import { EntityType } from "./EntityType"
import { Shape } from "./Shape"

export interface World {
    shapes: Shape[]
    entities: Entity[]
}

function customStringify(world: World) { 
    return JSON.stringify(world, (_, value) => {
        if (typeof value === "number") {
            return Math.round(value * 100) / 100
        }

        return value
    })
}

export function exportWorld(world: World): string {
    return LZString.compressToBase64("rw|" + customStringify(world))
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

export interface ValidationError {
    message: string
}

export function validate(world: World): ValidationError | null {
    if (world.entities.filter(entity => entity.type == EntityType.RedFlag).length == 0) {
        return { message: "Can not run world without a red flag" }
    }

    if (world.entities.filter(entity => entity.type == EntityType.Rocket).length == 0) {
        return { message: "Can not run world without a rocket" }
    }

    return null
}

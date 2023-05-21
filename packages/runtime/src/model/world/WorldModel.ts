
import LZString from "lz-string"

import { EntityModel } from "./EntityModel"
import { EntityModelType } from "./EntityModelType"
import { ShapeModel as ShapeModel } from "./ShapeModel"

export interface WorldModel {
    shapes: ShapeModel[]
    entities: EntityModel[]
}

function customStringify(world: WorldModel) { 
    return JSON.stringify(world, (_, value) => {
        if (typeof value === "number") {
            return Math.round(value * 100) / 100
        }

        return value
    })
}

export function exportWorld(world: WorldModel): string {
    return LZString.compressToBase64("rw|" + customStringify(world))
}

export function importWorld(world: string): WorldModel {
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

export function validate(world: WorldModel): ValidationError | null {
    if (world.entities.filter(entity => entity.type == EntityModelType.RedFlag).length == 0) {
        return { message: "Can not run world without a red flag" }
    }

    if (world.entities.filter(entity => entity.type == EntityModelType.Rocket).length == 0) {
        return { message: "Can not run world without a rocket" }
    }

    return null
}

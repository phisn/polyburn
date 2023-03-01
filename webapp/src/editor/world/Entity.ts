import { entities } from "./Entities"
import { Point } from "./Point"
import { scale, Size } from "./Size"

export enum EntityType {
    Rocket = "Rocket",
    GreenFlag = "GreenFlag",
    RedFlag = "RedFlag",
}

export interface Entity {
    position: Point
    rotation: number
    type: EntityType
}

export interface EntityRegisterEntry {
    scale: number
    size: Size
    anchor: Point

    src: string
}

export interface EntityRegistry {
    [key: string]: EntityRegisterEntry
}

export function isVertexInsideEntity({x, y}: Point, entity: Entity) {
    const size = scale(
        entities[entity.type].size,
        entities[entity.type].scale
    )
    
    const anchor = entities[entity.type].anchor

    const rotatedX =
        Math.cos(-entity.rotation) * (x - entity.position.x) -
        Math.sin(-entity.rotation) * (y - entity.position.y) +
        entity.position.x
    
    const rotatedY =
        Math.sin(-entity.rotation) * (x - entity.position.x) +
        Math.cos(-entity.rotation) * (y - entity.position.y) +
        entity.position.y
    
    const xMin = entity.position.x - size.width * anchor.x
    const xMax = entity.position.x + size.width * (1 - anchor.x)
    const yMin = entity.position.y - size.height * anchor.y
    const yMax = entity.position.y + size.height * (1 - anchor.y)

    return rotatedX >= xMin && rotatedX <= xMax && rotatedY >= yMin && rotatedY <= yMax
}

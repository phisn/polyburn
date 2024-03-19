import { EntityType } from "runtime/proto/world"
import { entityRegistry } from "runtime/src/model/world/entity-registry"
import { baseZoomFactor } from "../../../../common/constants"
import { EntityGraphicType } from "./entity-graphic-type"

export interface EntityGraphicRegisterEntry {
    scale: number
    src: string
    size: { width: number; height: number }
}

export const entityGraphicRegistry: {
    [K in `${EntityGraphicType}`]: EntityGraphicRegisterEntry
} = {
    [EntityGraphicType.Rocket]: {
        scale: 0.15 * baseZoomFactor,
        src: "/static/rocket.svg",
        size: entityRegistry[EntityType.ROCKET],
    },
    [EntityGraphicType.RedFlag]: {
        scale: 0.15 * baseZoomFactor,
        src: "/static/flag-red.svg",
        size: entityRegistry[EntityType.LEVEL],
    },
    [EntityGraphicType.GreenFlag]: {
        scale: 0.15 * baseZoomFactor,
        src: "/static/flag-green.svg",
        size: entityRegistry[EntityType.LEVEL],
    },
}

/*
export function entityRect(position: Point, rotation: number, type: EntityGraphicType) {
    const entry = entityGraphicRegistry[type]

    // Compute the position and size of the entity's bounding box
    const topLeft = changeAnchor(position, rotation, entry.size, { x: 0, y: 1 }, { x: 0, y: 0 })
    const bottomRight = changeAnchor(position, rotation, entry.size, { x: 0, y: 1 }, { x: 1, y: 1 })
    const topRight = changeAnchor(position, rotation, entry.size, { x: 0, y: 1 }, { x: 1, y: 0 })
    const bottomLeft = changeAnchor(position, rotation, entry.size, { x: 0, y: 1 }, { x: 0, y: 1 })

    return {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
    }
}

export function isPointInsideEntity(
    point: Point,
    position: Point,
    rotation: number,
    type: EntityGraphicType,
) {
    const entry = entityGraphicRegistry[type]

    const triangleArea = (a: Point, b: Point, c: Point) => {
        return (
            Math.abs(b.x * a.y - a.x * b.y + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)) / 2
        )
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = entityRect(position, rotation, type)

    const apd = triangleArea(topLeft, bottomLeft, point)
    const dpc = triangleArea(bottomLeft, bottomRight, point)
    const cpb = triangleArea(bottomRight, topRight, point)
    const pba = triangleArea(topRight, topLeft, point)

    const total = apd + dpc + cpb + pba

    return Math.floor(total) <= Math.ceil(entry.size.width * entry.size.height)
}
*/

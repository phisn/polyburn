import { EntityType } from "runtime/src/core/common/EntityType"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { EntityModel } from "runtime/src/model/world/EntityModel"
import { entityModelRegistry } from "runtime/src/model/world/EntityModelRegistry"
import { Point } from "runtime/src/model/world/Point"
import { baseZoomFactor } from "../../../common/Values"
import { EntityGraphicType } from "./EntityGraphicType"

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
        size: entityModelRegistry[EntityType.Rocket],
    },
    [EntityGraphicType.RedFlag]: {
        scale: 0.15 * baseZoomFactor,
        src: "/static/flag-red.svg",
        size: entityModelRegistry[EntityType.Level],
    },
    [EntityGraphicType.GreenFlag]: {
        scale: 0.15 * baseZoomFactor,
        src: "/static/flag-green.svg",
        size: entityModelRegistry[EntityType.Level],
    },
}

export function entityRect(entity: EntityModel) {
    const { position, rotation } = entity
    const entry = entityGraphicRegistry[entity.type]

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

export function isPointInsideEntity(point: Point, entity: EntityModel) {
    const entry = entityGraphicRegistry[entity.type]

    const triangleArea = (a: Point, b: Point, c: Point) => {
        return (
            Math.abs(b.x * a.y - a.x * b.y + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)) / 2
        )
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = entityRect(entity)

    const apd = triangleArea(topLeft, bottomLeft, point)
    const dpc = triangleArea(bottomLeft, bottomRight, point)
    const cpb = triangleArea(bottomRight, topRight, point)
    const pba = triangleArea(topRight, topLeft, point)

    const total = apd + dpc + cpb + pba

    return Math.floor(total) <= Math.ceil(entry.size.width * entry.size.height)
}

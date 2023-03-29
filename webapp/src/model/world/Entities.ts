import greenFlag from "../../assets/flag-green.svg"
import redFlag from "../../assets/flag-red.svg"
import rocket from "../../assets/rocket.svg"
import { baseZoomFactor } from "../../common/Values"
import { changeAnchor } from "../../common/math"
import { Entity, EntityRegistry, RocketEntity } from "./Entity"
import { EntityType } from "./EntityType"
import { Point } from "./Point"
import { scale } from "./Size"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

const common = (def: DistributiveOmit<Entity, "position" | "rotation">) => (position: Point, rotation: number, entity: Entity | null): Entity => ({
    ...def,
    ...entity,
    position,
    rotation,
})

export const entities: EntityRegistry = {
    [EntityType.Rocket]: {
        scale: 0.15 * baseZoomFactor,
        size: { width: 300, height: 600 },
        anchor: { x: 0, y: 1 },
        src: rocket,
        transformOrCreate: common({ type: EntityType.Rocket })
    },
    [EntityType.GreenFlag]: {
        scale: 0.15 * baseZoomFactor,
        size: { width: 275, height: 436 },
        anchor: { x: 0, y: 1 },
        src: greenFlag,
        transformOrCreate: common({ type: EntityType.GreenFlag })
    },
    [EntityType.RedFlag]: {
        scale: 0.15 * baseZoomFactor,
        size: { width: 275, height: 436 },
        anchor: { x: 0, y: 1 },
        src: redFlag,
        transformOrCreate: (position: Point, rotation: number, entity: Entity | null): Entity => {
            const entry = entities[EntityType.RedFlag]
            
            const center = changeAnchor(
                position,
                rotation,
                scale(entry.size, entry.scale),
                entry.anchor,
                { x: 0.5, y: 0.5 }
            )

            return {
                type: EntityType.RedFlag,

                cameraTopLeft: { x: center.x - 15, y: center.y + 15 },
                cameraBottomRight: { x: center.x + 15, y: center.y - 15 },

                captureLeft: 2,
                captureRight: 2,

                ...(entity as RocketEntity | null),

                position,
                rotation,
            }
        }
    },
}

export function entityRect(entity: Entity) {
    const { position, rotation } = entity
    const entry = entities[entity.type]
    const entitySize = scale(entry.size, entry.scale)

    // Compute the position and size of the entity's bounding box
    const topLeft = changeAnchor(
        position,
        rotation,
        entitySize,
        entry.anchor,
        { x: 0, y: 0 })

    const bottomRight = changeAnchor(
        position, 
        rotation, 
        entitySize,
        entry.anchor,
        { x: 1, y: 1 })

    const topRight = changeAnchor(
        position,
        rotation,
        entitySize,
        entry.anchor,
        { x: 1, y: 0 })

    const bottomLeft = changeAnchor(
        position,
        rotation,
        entitySize,
        entry.anchor,
        { x: 0, y: 1 })

    return {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
    }
}

export function isPointInsideEntity(point: Point, entity: Entity) {
    const entry = entities[entity.type]
    const entitySize = scale(entry.size, entry.scale)

    const triangleArea = (a: Point, b: Point, c: Point) => {
        return Math.abs((b.x * a.y - a.x * b.y) + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)) / 2
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = entityRect(entity)

    const apd = triangleArea(topLeft, bottomLeft, point)
    const dpc = triangleArea(bottomLeft, bottomRight, point)
    const cpb = triangleArea(bottomRight, topRight, point)
    const pba = triangleArea(topRight, topLeft, point)

    const total = apd + dpc + cpb + pba

    return Math.floor(total) <= Math.ceil(entitySize.width * entitySize.height)
}

import { snapDistance } from "../../common/Values"
import { changeAnchor } from "../../common/math"
import { entities } from "./Entities"
import { EntityType } from "./EntityType"
import { Point } from "./Point"
import { scale } from "./Size"

export interface FlagEntity {
    type: EntityType.RedFlag,

    position: Point
    rotation: number

    cameraTopLeft: Point
    cameraBottomRight: Point

    captureLeft: number
    captureRight: number
}

export const flagCaptureHeight = 0.5

export function captureBox(entity: FlagEntity) {
    const entry = entities[EntityType.RedFlag]

    const transformed = changeAnchor(
        entity.position,
        entity.rotation,
        scale(entry.size, entry.scale),
        entry.anchor,
        { x: 0.2, y: 0 }
    )

    const size = {
        width: entity.captureLeft + entity.captureRight,
        height: flagCaptureHeight,
    }

    return { size, transformed }
}

export function moveCameraSideTo(
    point: Point,
    side: "left" | "right" | "top" | "bottom",
    entity: FlagEntity,
): { cameraTopLeft: Point, cameraBottomRight: Point } {
    switch (side) {
    case "left":
        return {
            cameraTopLeft: {
                x: point.x,
                y: entity.cameraTopLeft.y,
            },
            cameraBottomRight: entity.cameraBottomRight,
        }
    case "right":
        return {
            cameraTopLeft: entity.cameraTopLeft,
            cameraBottomRight: {
                x: point.x,
                y: entity.cameraBottomRight.y,
            }
        }
    case "top":
        return {
            cameraTopLeft: {
                y: point.y,
                x: entity.cameraTopLeft.x,
            },
            cameraBottomRight: entity.cameraBottomRight,
        }
    case "bottom":
        return {
            cameraTopLeft: entity.cameraTopLeft,
            cameraBottomRight: {
                y: point.y,
                x: entity.cameraBottomRight.x,
            }
        }
    }
}

export function pointCloseToCameraSide(
    point: Point,
    entity: FlagEntity,
): "left" | "right" | "top" | "bottom" | null {
    // camera is a rectangle defined by entity.cameraTopLeft and entity.cameraBottomRight. Check if a side
    // close to the point (up to distance snapDistance) and return the side if it is.

    // check left side
    if (point.x >= entity.cameraTopLeft.x - snapDistance && point.x <= entity.cameraTopLeft.x + snapDistance &&
        point.y <= entity.cameraTopLeft.y && point.y >= entity.cameraBottomRight.y) {
        return "left"
    }

    // check right side
    if (point.x >= entity.cameraBottomRight.x - snapDistance && point.x <= entity.cameraBottomRight.x + snapDistance &&
        point.y <= entity.cameraTopLeft.y && point.y >= entity.cameraBottomRight.y) {
        return "right"
    }

    // check top side
    if (point.y >= entity.cameraTopLeft.y - snapDistance && point.y <= entity.cameraTopLeft.y + snapDistance &&
        point.x >= entity.cameraTopLeft.x && point.x <= entity.cameraBottomRight.x) {
        return "top"
    }

    // check bottom side
    if (point.y >= entity.cameraBottomRight.y - snapDistance && point.y <= entity.cameraBottomRight.y + snapDistance &&
        point.x >= entity.cameraTopLeft.x && point.x <= entity.cameraBottomRight.x) {
        return "bottom"
    }

    // no side is close to the point
    return null
}

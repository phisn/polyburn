import { EntityType } from "../../core/common/EntityType"
import { Point } from "../Point"

export interface FlagEntityModel {
    type: EntityType.Level

    position: Point
    rotation: number

    cameraTopLeft: Point
    cameraBottomRight: Point

    captureLeft: number
    captureRight: number
}

export function moveCameraSideTo(
    point: Point,
    side: "left" | "right" | "top" | "bottom",
    entity: FlagEntityModel,
): { cameraTopLeft: Point; cameraBottomRight: Point } {
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
                },
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
                },
            }
    }
}

export function pointCloseToCameraSide(
    point: Point,
    entity: FlagEntityModel,
    snapDistance: number,
): "left" | "right" | "top" | "bottom" | null {
    // camera is a rectangle defined by entity.cameraTopLeft and entity.cameraBottomRight. Check if a side
    // close to the point (up to distance snapDistance) and return the side if it is.

    // check left side
    if (
        point.x >= entity.cameraTopLeft.x - snapDistance &&
        point.x <= entity.cameraTopLeft.x + snapDistance &&
        point.y <= entity.cameraTopLeft.y &&
        point.y >= entity.cameraBottomRight.y
    ) {
        return "left"
    }

    // check right side
    if (
        point.x >= entity.cameraBottomRight.x - snapDistance &&
        point.x <= entity.cameraBottomRight.x + snapDistance &&
        point.y <= entity.cameraTopLeft.y &&
        point.y >= entity.cameraBottomRight.y
    ) {
        return "right"
    }

    // check top side
    if (
        point.y >= entity.cameraTopLeft.y - snapDistance &&
        point.y <= entity.cameraTopLeft.y + snapDistance &&
        point.x >= entity.cameraTopLeft.x &&
        point.x <= entity.cameraBottomRight.x
    ) {
        return "top"
    }

    // check bottom side
    if (
        point.y >= entity.cameraBottomRight.y - snapDistance &&
        point.y <= entity.cameraBottomRight.y + snapDistance &&
        point.x >= entity.cameraTopLeft.x &&
        point.x <= entity.cameraBottomRight.x
    ) {
        return "bottom"
    }

    // no side is close to the point
    return null
}

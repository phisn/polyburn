import { EntityType } from "../../../proto/world"
import { Point } from "../point"
import { changeAnchor } from "./change-anchor"
import { entityRegistry } from "./entity-registry"

export const flagCaptureHeight = 0.5

export function captureBox(
    position: Point,
    rotation: number,
    captureDistanceLeft: number,
    captureDistanceRight: number,
) {
    const entry = entityRegistry[EntityType.LEVEL]

    const transformed = changeAnchor(
        { x: position.x, y: position.y },
        rotation,
        entry,
        { x: 0.5, y: 1 },
        { x: 0.2, y: 0 },
    )

    const size = {
        width: captureDistanceLeft + captureDistanceRight,
        height: flagCaptureHeight,
    }

    return { size, transformed }
}

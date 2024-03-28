import { EntityType, LevelModel } from "../../../proto/world"
import { changeAnchor } from "./change-anchor"
import { entityRegistry } from "./entity-registry"

export const flagCaptureHeight = 0.5

export function captureBox(level: LevelModel) {
    const entry = entityRegistry[EntityType.LEVEL]

    const transformed = changeAnchor(
        { x: level.positionX, y: level.positionY },
        level.rotation,
        entry,
        { x: 0.5, y: 1 },
        { x: 0.2, y: 0 },
    )

    const size = {
        width: level.captureAreaLeft + level.captureAreaRight,
        height: flagCaptureHeight,
    }

    return { size, transformed }
}

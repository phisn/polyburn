import { EntityType } from "runtime/src/core/common/EntityType"
import { changeAnchor } from "runtime/src/model/changeAnchor"
import { Point } from "runtime/src/model/world/Point"
import { entityGraphicRegistry } from "../../../../../game/runtime-view/graphics/EntityGraphicRegistry"
import { WorldState } from "../../../models/WorldState"
import { LevelState } from "../LevelState"

export const levelNew = (position: Point, rotation: number) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const entry = entityGraphicRegistry[EntityType.Level]
    const center = changeAnchor(position, 0, entry.size, { x: 0, y: 1 }, { x: 0.2, y: 0.5 })

    const level: LevelState = {
        type: EntityType.Level,

        id,

        position,
        rotation,

        cameraTopLeft: { x: center.x - 4, y: center.y + 4 },
        cameraBottomRight: { x: center.x + 4, y: center.y - 4 },

        captureLeft: 0,
        captureRight: 0,
    }

    return {
        do() {
            world.entities.set(id, level)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}

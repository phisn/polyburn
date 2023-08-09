import { EntityType } from "runtime/src/core/common/EntityType"
import { Point } from "runtime/src/model/world/Point"
import { WorldState } from "../../../models/WorldState"
import { LevelState } from "../LevelState"

export const levelNew = (position: Point, rotation: number) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const level: LevelState = {
        type: EntityType.Level,

        id,

        position,
        rotation,
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

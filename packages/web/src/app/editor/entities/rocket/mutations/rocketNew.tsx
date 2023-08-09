import { EntityType } from "runtime/src/core/common/EntityType"
import { Point } from "runtime/src/model/world/Point"
import { WorldState } from "../../../models/WorldState"
import { RocketState } from "../RocketState"

export const rocketNew = (position: Point, rotation: number) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const rocket: RocketState = {
        type: EntityType.Rocket,

        id,

        position,
        rotation,
    }

    return {
        do() {
            world.entities.set(id, rocket)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}

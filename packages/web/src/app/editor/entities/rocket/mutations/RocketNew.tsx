import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/Point"
import { WorldState } from "../../../models/world-state"
import { RocketState } from "../rocket-state"

export const rocketNew = (position: Point, rotation: number) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const rocket: RocketState = {
        type: EntityType.ROCKET,

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

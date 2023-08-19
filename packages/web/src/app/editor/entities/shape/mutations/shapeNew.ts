import { EntityType } from "runtime/proto/world"
import { Point } from "runtime/src/model/Point"
import { WorldState } from "../../../models/WorldState"
import { ShapeState } from "../ShapeState"

export const shapeNew = (position: Point) => (world: WorldState) => {
    const id = [...world.entities.keys()].reduce((max, id) => Math.max(max, id), 0) + 1

    const shape: ShapeState = {
        type: EntityType.SHAPE,
        id,
        position,
        vertices: [
            {
                position: { x: 0, y: -2 },
                color: 0xff0000,
            },
            {
                position: { x: -2, y: -2 },
                color: 0xffffff,
            },
            {
                position: { x: 2, y: -2 },
                color: 0xffffff,
            },
        ],
    }

    return {
        do() {
            world.entities.set(id, shape)
        },
        undo() {
            world.entities.delete(id)
        },
    }
}
